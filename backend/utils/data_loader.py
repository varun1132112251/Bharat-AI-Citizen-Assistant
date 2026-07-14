import json
import os

SCHEMES = []

def load_schemes():
    global SCHEMES

    SCHEMES = []

    data_folder = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data",
        "schemes"
    )

    for filename in os.listdir(data_folder):

        if filename.endswith(".json"):

            file_path = os.path.join(data_folder, filename)

            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read().strip()

                if not content:
                    print(f"⚠️ Skipping empty file: {filename}")
                    continue

                schemes = json.loads(content)
                SCHEMES.extend(schemes)
                
    print(f"✅ Loaded {len(SCHEMES)} schemes.")

    return SCHEMES