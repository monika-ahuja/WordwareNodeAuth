import sys
import json
import pickle
import os

data = json.loads(sys.argv[1])

with open("data.pkl", "wb") as f:
    pickle.dump(data, f)

if os.path.exists("data.pkl"):
    print("Pickle file created successfully")
else:
    print("Pickle file NOT created")
