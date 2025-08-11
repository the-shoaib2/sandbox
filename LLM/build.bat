@echo off
echo Creating virtual environment...
python -m venv venv
call venv\Scripts\activate

echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt
pip install pyinstaller

echo Building executable...
pyinstaller --onefile --name llm_runner --add-data "%CD%\models;models" --hidden-import transformers llm_runner.py

echo Done! The executable is in the 'dist' folder.
pause
