import torch
from transformers import CLIPProcessor, CLIPModel

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Loading CLIP on {device}...")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
proc = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

brands = {
    "SBI": ("onlinesbi.sbi", "State Bank of India SBI blue keyhole logo login portal"),
    "HDFC": ("hdfcbank.com", "HDFC Bank red and blue logo netbanking login page"),
    "ICICI": ("icicibank.com", "ICICI Bank orange maroon logo internet banking login"),
    "Axis": ("axisbank.com", "Axis Bank burgundy logo internet banking login"),
    "PNB": ("pnbindia.in", "Punjab National Bank PNB maroon yellow logo login"),
    "DigiLocker": ("digilocker.gov.in", "DigiLocker Indian national emblem blue purple logo login"),
    "IncomeTax": ("incometax.gov.in", "Income Tax Department e-Filing Government of India portal"),
    "IndiaPost": ("indiapost.gov.in", "India Post red yellow wings logo delivery tracking"),
    "IRCTC": ("irctc.co.in", "IRCTC Indian Railways blue logo ticket login"),
    "UPI": ("npci.org.in", "BHIM UPI official tricolour arrow logo payment")
}

gallery = {}
with torch.no_grad():
    for name, (dom, prompt) in brands.items():
        inp = proc(text=[prompt], return_tensors="pt", padding=True).to(device)
        out = model.get_text_features(**inp)
        # Handle both raw Tensor and BaseModelOutputWithPooling across transformers versions
        if isinstance(out, torch.Tensor):
            vec = out
        elif hasattr(out, "text_embeds"):
            vec = out.text_embeds
        else:
            vec = model.text_projection(out.pooler_output)
        vec = vec / vec.norm(p=2, dim=-1, keepdim=True)
        gallery[name] = {"domain": dom, "vector": vec.cpu()}
        print(f"Encoded: {name}")

torch.save(gallery, "models/brand_vectors.pt")
print("Cell 4 Complete: Saved models/brand_vectors.pt!")