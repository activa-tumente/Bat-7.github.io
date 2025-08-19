@echo off
echo "Building the project..."
call npm run build

echo "Switching to a temporary deployment branch..."
call git checkout --orphan gh-pages-temp

echo "Adding the dist folder..."
call git add -f dist

echo "Committing the changes..."
call git commit -m "Deploy to GitHub Pages"

echo "Pushing to gh-pages branch..."
call git push -f origin HEAD:gh-pages

echo "Returning to the master branch..."
call git checkout main

echo "Deleting the temporary branch..."
call git branch -D gh-pages-temp

echo "Deployment complete."