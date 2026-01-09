import sys
import json
import pickle

# Read JSON data passed from Node.js
data = json.loads(sys.argv[1])

# Save pickle file
with open("data.pkl", "wb") as f:
    pickle.dump(data, f)

print("Pickle file created successfully")
