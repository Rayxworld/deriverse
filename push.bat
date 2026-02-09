@echo off
SET /P msg="Enter commit message: "
IF "%msg%"=="" SET msg="Fix deployment scripts"

echo 🚀 Adding changes...
git add .

echo 📝 Committing changes...
git commit -m "%msg%"

echo 📤 Pushing to GitHub...
git push

echo ✅ Done!
pause
