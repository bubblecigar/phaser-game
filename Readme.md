# repository:
https://github.com/bubblecigar/phaser-game

# development
npm run server
parcel watch 
parcel watch client/index.html

# deploy:
parcel build client/index.html
git push
git push heroku master

# production:
https://farmer-game-123.herokuapp.com/