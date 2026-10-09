
import os

from flask import Flask, render_template, request, jsonify, send_from_directory

import tensorflow as tf


# -----------------------------
# FLASK APP
# -----------------------------

app = Flask(
    __name__,
    template_folder="."
)


# -----------------------------
# LOAD TRAINED MODEL
# -----------------------------

model_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "plant_disease_model.keras"
)

model = tf.keras.models.load_model(model_path)

print("Trained model loaded successfully!")

print("Model input shape:", model.input_shape)
print("Model output shape:", model.output_shape)


# -----------------------------
# CLASS NAMES
# -----------------------------

class_names = [
    "Chilli_Anthracnose",
    "Chilli_Healthy",
    "Chilli_Leaf_Curl",
    "Chilli_Powdery_Mildew",
    "Grapes_Bacterial_Leaf_Spot",
    "Grapes_Downy_Mildew",
    "Grapes_Healthy",
    "Grapes_Powdery_Mildew",
    "Mango_Anthracnose",
    "Mango_Bacterial_Canker",
    "Mango_Healthy",
    "Mango_Powdery_Mildew",
    "Neem_Alternaria_Leaf_Spot",
    "Neem_Dieback_Disease",
    "Neem_Healthy",
    "Neem_Powdery_Mildew",
    "Tomato_Early_Blight",
    "Tomato_Healthy",
    "Tomato_Late_Blight",
    "Tomato_Leaf_Mold"
]


# -----------------------------
# HOME PAGE
# -----------------------------

@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------
# CSS FILE
# -----------------------------

@app.route("/style.css")
def style():
    return send_from_directory(
        os.path.dirname(__file__),
        "style.css"
    )


# -----------------------------
# JAVASCRIPT FILE
# -----------------------------

@app.route("/script.js")
def script():
    return send_from_directory(
        os.path.dirname(__file__),
        "script.js"
    )


# -----------------------------
# PREDICT DISEASE
# -----------------------------

@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({
            "error": "No image received"
        }), 400

    file = request.files["image"]

    image_bytes = file.read()

    image = tf.io.decode_image(
        image_bytes,
        channels=3,
        expand_animations=False
    )

    image = tf.image.resize(
        image,
        [224, 224]
    )

    image = tf.cast(
        image,
        tf.float32
    ) / 255.0

    image = tf.expand_dims(
        image,
        axis=0
    )

    prediction = model.predict(
        image,
        verbose=0
    )

    predicted_class = int(
        tf.argmax(prediction[0]).numpy()
    )

    confidence = float(
        prediction[0][predicted_class]
    )

    disease = class_names[predicted_class]

    print("Predicted disease:", disease)
    print("Confidence:", confidence)

    return jsonify({
        "disease": disease,
        "confidence": confidence
    })


# -----------------------------
# START FLASK
# -----------------------------

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)