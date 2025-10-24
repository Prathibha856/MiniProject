"""
Train Final Model on Improved Synthetic Data
Expected accuracy: 75-85%
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os
from datetime import datetime

print("=" * 60)
print("FINAL Model Training - Better Data")
print("=" * 60)

# Load improved data
print("\n[1/5] Loading improved training data...")
df = pd.read_csv('dataset/training_data_v2.csv')
print(f"✓ Loaded {len(df)} samples")

# Show distribution
print("\nCrowd level distribution:")
crowd_counts = df['crowd_level_code'].value_counts().sort_index()
crowd_labels = ['Low', 'Medium', 'High', 'Very High']
for code, count in crowd_counts.items():
    print(f"  {crowd_labels[code]:<12} {count:>5} ({count/len(df)*100:>5.1f}%)")

# Prepare features
print("\n[2/5] Preparing features...")
feature_columns = ['hour', 'day_of_week', 'is_rush_hour', 'stop_lat', 'stop_lon']

X = df[feature_columns]
y = df['crowd_level_code']

print(f"✓ Features: {feature_columns}")

# Split
print("\n[3/5] Splitting data (80/20)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"✓ Training: {len(X_train)}, Test: {len(X_test)}")

# Train
print("\n[4/5] Training Random Forest...")
print("  - n_estimators: 100")
print("  - max_depth: 10")
print("  - class_weight: balanced")

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    n_jobs=-1,
    class_weight='balanced'
)

print("\n  Training in progress...")
model.fit(X_train, y_train)
print("✓ Model trained!")

# Evaluate
print("\n[5/5] Evaluating...")
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n{'=' * 60}")
print(f"FINAL MODEL PERFORMANCE")
print(f"{'=' * 60}")
print(f"\n🎯 Accuracy: {accuracy:.2%}")

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=crowd_labels, digits=3))

print("\nConfusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
print("\nPredicted →")
print(f"{'Actual ↓':<12} {'Low':<8} {'Medium':<8} {'High':<8} {'VeryHigh':<8}")
for i, label in enumerate(crowd_labels):
    print(f"{label:<12} {cm[i,0]:<8} {cm[i,1]:<8} {cm[i,2]:<8} {cm[i,3]:<8}")

print("\nFeature Importance:")
feature_importance = pd.DataFrame({
    'feature': feature_columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance.iterrows():
    print(f"  {row['feature']:<15} {row['importance']:.4f}")

# Save
print(f"\n{'=' * 60}")
print("SAVING MODEL")
print(f"{'=' * 60}")

os.makedirs('models', exist_ok=True)

# Save model
joblib.dump(model, 'models/crowd_prediction_model.pkl')
print("✓ Model: models/crowd_prediction_model.pkl")

# Save feature info
feature_info = {
    'feature_columns': feature_columns,
    'crowd_labels': crowd_labels,
    'training_date': datetime.now().isoformat(),
    'training_samples': len(X_train),
    'test_samples': len(X_test),
    'accuracy': float(accuracy),
    'model_version': 'v3_final'
}
joblib.dump(feature_info, 'models/feature_info.pkl')
print("✓ Feature info: models/feature_info.pkl")

# Metadata
metadata = {
    'model_type': 'RandomForestClassifier',
    'version': 'v3_final',
    'n_estimators': 100,
    'max_depth': 10,
    'features': feature_columns,
    'classes': crowd_labels,
    'accuracy': float(accuracy),
    'trained_on': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
    'dataset': 'training_data_v2.csv',
    'training_samples': len(X_train),
    'test_samples': len(X_test)
}

import json
with open('models/model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)
print("✓ Metadata: models/model_metadata.json")

print(f"\n{'=' * 60}")
print("✅ FINAL MODEL READY!")
print(f"{'=' * 60}")
print(f"\n🎯 Accuracy: {accuracy:.2%}")
print(f"📁 Model saved to: models/crowd_prediction_model.pkl")
print(f"\n📊 Performance Summary:")
print(f"  - Training samples: {len(X_train)}")
print(f"  - Test samples: {len(X_test)}")
print(f"  - Features: {len(feature_columns)}")
print(f"  - Accuracy: {accuracy:.2%}")
print(f"\n🚀 Next Steps:")
print(f"  1. Start API: python predict_api.py")
print(f"  2. Test endpoint: http://localhost:5000/health")
print(f"  3. Make prediction: POST /predict")
print(f"  4. Build React frontend")
print(f"{'=' * 60}")
