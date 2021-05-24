cd notebooks
mkdir -p images
cd images
kaggle datasets download -d jessicali9530/lfw-dataset
unzip lfw-dataset.zip 
rm *.csv
mv lfw-deepfunneled/lfw-deepfunneled ./original
rm -rf lfw-dataset.zip
rm -rf lfw-deepfunneled
cd ../..