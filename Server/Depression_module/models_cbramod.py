import torch
import torch.nn as nn
from einops.layers.torch import Rearrange
from Depression_module.models.cbramod import CBraMod  


class CBraModMumtaz(nn.Module):
    def __init__(self, param):
        super().__init__()

        self.backbone = CBraMod(d_model=200, n_layer=12, nhead=8)

        self.backbone.proj_out = nn.Identity()

        if param.classifier == 'all_patch_reps_twolayer':
            self.classifier = nn.Sequential(
                Rearrange('b c s p -> b (c s p)'),
                nn.Linear(19 * 5 * 200, 200),
                nn.ELU(),
                nn.Dropout(param.dropout),
                nn.Linear(200, 1),
            )
        else:
            raise ValueError("Unsupported classifier type")

        if param.use_pretrained_weights:
            state = torch.load(param.pretrained_ckpt_path, map_location=param.device)
            # Load entire checkpoint into whole wrapper model
            self.load_state_dict(state)

    def forward(self, x):
        features = self.backbone(x)
        out = self.classifier(features).squeeze(1)
        return out


class Params:
    use_pretrained_weights = True  
    pretrained_ckpt_path = './Depression_module/models/best_cbramod_mumtaz.pth' 
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    classifier = 'all_patch_reps_twolayer'
    dropout = 0.1
    batch_size = 16
