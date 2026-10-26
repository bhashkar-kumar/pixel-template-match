"""NeuMF model definition. Must match the architecture used in train.py exactly so the saved weights load."""
import torch
import torch.nn as nn


class NeuMF(nn.Module):
    def __init__(self, n_users, n_items, k=32, mlp=(64, 32, 16), drop=0.3, global_mean=3.5):
        super().__init__()
        self.global_mean = global_mean
        self.gu = nn.Embedding(n_users, k)
        self.gi = nn.Embedding(n_items, k)
        self.mu = nn.Embedding(n_users, mlp[0] // 2)
        self.mi = nn.Embedding(n_items, mlp[0] // 2)
        self.bu = nn.Embedding(n_users, 1)
        self.bi = nn.Embedding(n_items, 1)
        layers, d = [], mlp[0]
        for h in mlp[1:]:
            layers += [nn.Linear(d, h), nn.ReLU(), nn.Dropout(drop)]
            d = h
        self.mlp = nn.Sequential(*layers)
        self.out = nn.Linear(k + d, 1)

    def forward(self, u, i):
        g = self.gu(u) * self.gi(i)
        h = self.mlp(torch.cat([self.mu(u), self.mi(i)], -1))
        return self.global_mean + self.bu(u).squeeze(-1) + self.bi(i).squeeze(-1) + \
            self.out(torch.cat([g, h], -1)).squeeze(-1)

    def forward_vec(self, gu_vec, mu_vec, bu_val, i):
        """Same as forward, but the user is given as raw vectors (used for brand-new users)."""
        n = i.shape[0]
        g = gu_vec.expand(n, -1) * self.gi(i)
        h = self.mlp(torch.cat([mu_vec.expand(n, -1), self.mi(i)], -1))
        return self.global_mean + bu_val + self.bi(i).squeeze(-1) + \
            self.out(torch.cat([g, h], -1)).squeeze(-1)


def fit_new_user(model, item_idx, ratings, steps=150, lr=0.05, reg=0.3):
    """Learn a user vector for someone not in the training data, keeping the model frozen.
    Starts from the average user, then nudges it to explain the ratings the visitor gave."""
    with torch.enable_grad():
        gu = model.gu.weight.detach().mean(0).clone().requires_grad_(True)
        mu = model.mu.weight.detach().mean(0).clone().requires_grad_(True)
        bu = torch.zeros(1, requires_grad=True)
        opt = torch.optim.Adam([gu, mu, bu], lr=lr)
        for _ in range(steps):
            pred = model.forward_vec(gu, mu, bu, item_idx)
            loss = nn.functional.mse_loss(pred, ratings) + reg * (gu.pow(2).sum() + mu.pow(2).sum() + bu.pow(2).sum())
            opt.zero_grad()
            loss.backward()
            opt.step()
    return gu.detach(), mu.detach(), bu.detach()
