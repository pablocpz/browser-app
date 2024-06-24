"""
This is the main file for the SAM model hosting server.
"""

import os
import sys

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Suppress TensorFlow INFO and WARNING messages
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Set environment variable to allow duplicate OpenMP runtime
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

try:
    from fastapi import FastAPI, File, UploadFile, Form
    from fastapi.responses import JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles  # Import StaticFiles
    # from mobile_sam.modeling.image_encoder import ImageEncoderViT
    # import torch
    from PIL import Image
    import io
    import os
    import shutil
    # import warnings
    import numpy as np
    import base64

    from deepface import DeepFace
    import pandas as pd
    # import logging
    # # Configure logging
    # logging.basicConfig(level=logging.INFO)

    # warnings.filterwarnings(
    #     "ignore", category=UserWarning, message="Overwriting tiny_vit_5m_224 in registry"
    # ) 


    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://browser-ai-demo-edm87c51y-neuralroots-projects.vercel.app/", "https://browser-ai-demo.vercel.app"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    # CRIMINAL_DATA_DIR = "/../../criminal_data"
    CRIMINAL_DATA_DIR = "/app/criminal_data"
    # CRIMINAL_DATA_DIR = "C:/Users/pablo/Mi unidad/Neural Networks/project/react part/object-detection-app LAST but without btns/criminal_data"
    # CRIMINAL_DATA_DIR = "/../../criminal_data"


    # Mount the criminal data directory to serve static files
    app.mount("/criminal_data", StaticFiles(directory=CRIMINAL_DATA_DIR), name="criminal_data")

    # model = ImageEncoderViT()
    # sam_encoder = CustomSam(image_encoder=model)
    # device = "cuda" if torch.cuda.is_available() else "cpu"
    # sam_encoder.to(device)




    @app.post("/process-image/")
    async def process_image(file: UploadFile = File(...), confidence_threshold: float = 0.5):
        """
        Endpoint to process an uploaded image and return its embeddings.

        Args:
            file (UploadFile): The image file to be processed.
            confidence_threshold (float): The confidence threshold for face detection.

        Returns:
            JSONResponse: A JSON response containing the embeddings of the image or an error message.
        """
        try:
            image = Image.open(io.BytesIO(await file.read())).convert("RGB")
            
            print("received")
            # Convert the image to a numpy array
            x = np.array(image)
            print("converted")
            print(x.shape)
            face_objs = DeepFace.extract_faces( #extracting faces from the input image
                img_path = x, 
                detector_backend = "yolov8", #"retinaface",
                enforce_detection=True
                
            )
            
            print("this",face_objs)
            #returns a list of dictionaries, each one with face pixels, confidence, width. height...etc 
            
            detected_faces = [face_objs[idx]["face"] for idx in range(0, len(face_objs)) \
                    if face_objs[idx]["confidence"] > confidence_threshold
                    ]
            
            #will be an empty list if there's no face detected
            
            #for each detected face, run verify() to know whether it is in the database
            
            
            
            recognition_results = [
                DeepFace.find(
                img_path = detected_faces[idx],
                db_path = "../../criminal_data", 
                enforce_detection=False, #si no hay cara, no se verifica,
                # distance_metric="euclidean_l2",
                distance_metric="cosine", #both are good with VGG-Face

                align=False, #slightly better performance with False
                model_name="VGG-Face" #"FaceNet-512"
                # model_name=

                ) if len(detected_faces) > 0 else []
                #obtenemos el primer elemento de la lista que devuelve find()
                #ya que lo hace para cada cara, y nosotros solo entregamos de 1 en 1

                        for idx in range(0, len(detected_faces))
                    ]
            
            #the less distance, the more likely they are to be the same face

            empty_table = pd.DataFrame(columns=["identity",  "hash", \
                                        "target_x", "target_y", "target_w", "target_h",\
                                            "source_x", "source_y", "source_w", "source_h", \
                                                "threshold", "distance"])

            print(recognition_results)

            recognition_results = [pd.DataFrame(result[0].query("distance == distance.min() & distance < threshold")) \
                if len(result[0])>=0 else empty_table
                        
                            for result in recognition_results 
                            ]
            #we'll get a dataframe for each detected criminal
            #each dataframe has a property for the path to the criminal they think the input belongs
            #along with the euclidean L2 similarity and it's threshold (if value < threshold, = face)


            #we'll try first just getting the minimum distance without validating threshold nor
            #converting it to an interpretable confidence value

            recognized_criminals = [result.identity[0].split("\\")[-2] if len(result)>0 else " "
                                    for result in recognition_results
                                    # if result.distance[0] < result.threshold[0]
                                    ]

            recognized_similarities = [result.distance[0] if len(result)>0 else " "
                                    for result in recognition_results
                                    ]
            
            recognized_similarities = [((val+1)/2) if val!=" " else " " for val in recognized_similarities]
            #the model already gives the criminal ocurrence with biggest probability of
            #being that criminal, so we don't need to check if it's above threshold
            
            
            #we return the list of recognized criminals e.g ["Mbappe", "Fernan"..etc]
            #for each input face of the photo
            
            

            # print("result", result)
            return JSONResponse(content={"recognition": recognized_criminals, "similarities": recognized_similarities}, status_code=200)
        except IOError as e:
            return JSONResponse(content={"error": f"File error: {str(e)}"}, status_code=400)
        except ValueError as e:
            return JSONResponse(content={"error": f"Data error: {str(e)}"}, status_code=400)
        except RuntimeError as e:
            return JSONResponse(
                content={"error": f"Model error: {str(e)}"}, status_code=500
            )

    @app.post("/create-criminal/")
    async def create_criminal(name: str = Form(...), files: list[UploadFile] = File(...)):
        """
        Endpoint to create a new criminal record with associated images.

        Args:
            name (str): The name of the criminal.
            files (list[UploadFile]): A list of image files associated with the criminal.

        Returns:
            JSONResponse: A JSON response indicating the success of the operation.
        """
        
        criminal_dir = os.path.join(CRIMINAL_DATA_DIR, name)
        
        if os.path.exists(criminal_dir):
            return JSONResponse(
                content={"message": f"Criminal {name} already exists"}, status_code=400
            )
        
        os.makedirs(criminal_dir, exist_ok=True)

        for file in files:
            file_path = os.path.join(criminal_dir, file.filename)
            with open(file_path, "wb") as f:
                f.write(await file.read())

        return JSONResponse(content={"message": f"Criminal {name} created successfully"})

    @app.post("/delete-criminal/")
    async def delete_criminal(name: str = Form(...)):
        """
        Endpoint to delete a criminal record.

        Args:
            name (str): The name of the criminal to be deleted.

        Returns:
            JSONResponse: A JSON response indicating the success or failure of the operation.
        """
        criminal_dir = os.path.join(CRIMINAL_DATA_DIR, name)
        if os.path.exists(criminal_dir):
            shutil.rmtree(criminal_dir)
            return JSONResponse(
                content={"message": f"Criminal {name} deleted successfully"}
            )
        else:
            return JSONResponse(
                content={"message": f"Criminal {name} not found"}, status_code=404
            )


    @app.post("/edit-criminal/")
    async def edit_criminal(name: str = Form(...), files: list[UploadFile] = File(...)):
        """
        Endpoint to edit an existing criminal record by adding or updating images.

        Args:
            name (str): The name of the criminal to be edited.
            files (list[UploadFile]): A list of image files to be added or updated.

        Returns:
            JSONResponse: A JSON response indicating the success or failure of the operation.
        """
        criminal_dir = os.path.join(CRIMINAL_DATA_DIR, name)
        if not os.path.exists(criminal_dir):
            return JSONResponse(
                content={"message": f"Criminal {name} not found"}, status_code=404
            )

        for file in files:
            file_path = os.path.join(criminal_dir, file.filename)
            with open(file_path, "wb") as f:
                f.write(await file.read())

        return JSONResponse(content={"message": f"Criminal {name} updated successfully"})


    @app.get("/list-criminals/")
    async def list_criminals():
        """
        Endpoint to list all criminals and their associated images.

        Returns:
            JSONResponse: A JSON response containing a list of criminals and their images.
        """
        if not os.path.exists(CRIMINAL_DATA_DIR):
            return JSONResponse(content={"error": "Criminal data directory does not exist"}, status_code=404)

        criminals = []
        for criminal_name in os.listdir(CRIMINAL_DATA_DIR):
            criminal_dir = os.path.join(CRIMINAL_DATA_DIR, criminal_name)
            if os.path.isdir(criminal_dir):
                images = [
                    f"/criminal_data/{criminal_name}/{img}" #os.path.join(criminal_dir, img)
                    for img in os.listdir(criminal_dir)
                    if img.endswith((".png", ".jpg", ".jpeg"))
                ]
                criminals.append({"name": criminal_name, "images": images})

        return JSONResponse(content=criminals)

    @app.get("/get-criminal-images/{criminal_name}")
    async def get_criminal_images(criminal_name: str):
        """
        Endpoint to get images for a given criminal name.

        Args:
            criminal_name (str): The name of the criminal.

        Returns:
            JSONResponse: A JSON response containing the list of image URLs.
        """
        criminal_dir = os.path.join(CRIMINAL_DATA_DIR, criminal_name)
        if not os.path.exists(criminal_dir):
            return JSONResponse(content={"error": "Criminal not found"}, status_code=404)

        images = []
        for filename in os.listdir(criminal_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                images.append(f"http://localhost:8000/criminal_data/{criminal_name}/{filename}")

        return JSONResponse(content={"images": images}, status_code=200)

    @app.get("/get-images/")
    async def get_images():
        sample_images_dir = "../../sample_images"
        images = []
        
        try:
            for filename in os.listdir(sample_images_dir):
                if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                    file_path = os.path.join(sample_images_dir, filename)
                    with open(file_path, "rb") as image_file:
                        encoded_string = base64.b64encode(image_file.read()).decode()
                        images.append(encoded_string)
                        
                        print("yeag")
            
            return JSONResponse(content={"images": images}, status_code=200)
        except Exception as e:
            return JSONResponse(content={"error": str(e)}, status_code=500)

    @app.get("/")
    async def root():
        return {"message": "Criminal Detection API is running"}

    if __name__ == "__main__":
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8000)

except ImportError as e:
    print(f"Error importing required libraries: {e}")
    sys.exit(1)

