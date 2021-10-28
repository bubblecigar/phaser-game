import gameConfig from '../../game/config'

export const generateInputForm = () => {
  const marginTop = gameConfig.canvasHeight * 0.2

  return `
  <style>
    .login {
      margin-top: ${marginTop}px;
      width: 100%;
      transform: scale(.5);
    }

    input[type="text"] {
      background: linear-gradient(top, #d6d7d7, #dee0e0);
      border: 1px solid #a1a3a3;
      border-radius: 4px;
      box-shadow: 0 1px #fff;
      box-sizing: border-box;
      color: #696969;
      height: 39px;
      margin: 31px 0 0;
      padding-left: 20px;
      transition: box-shadow 0.3s;
      width: 47%;
    }

    #Room-ID {
      margin-left: 4%;
    }

    input[type="text"]:focus {
      box-shadow: 0 0 4px 1px rgba(55, 166, 155, 0.3);
      outline: 0;
    }

    input[type="submit"] {
      width: 100%;
      height: 35px;
      display: block;
      font-family: Arial, "Helvetica", sans-serif;
      font-size: 16px;
      font-weight: bold;
      color: #fff;
      text-decoration: none;
      text-transform: uppercase;
      text-align: center;
      text-shadow: 1px 1px 0px #37a69b;
      padding-top: 6px;
      margin: 29px 0 0 0;
      position: relative;
      cursor: pointer;
      border: none;
      background-color: #37a69b;
      background-image: linear-gradient(top, #3db0a6, #3111);
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      border-bottom-left-radius: 5px;
      box-shadow: inset 0px 1px 0px #2ab7ec, 0px 5px 0px 0px #497a78, 0px 5px 5px #999;
    }

    input[type="submit"]:active {
      top: 3px;
      box-shadow: inset 0px 1px 0px #2ab7ec, 0px 2px 0px 0px #31524d, 0px 0px 3px #999;
    }

    #sound {
      margin: 28px 17px 29px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: end;
    }

    #sound-checkbox {
      border-radius: 5px;
      cursor: pointer;
      height: 16px;
      width: 16px;
      margin: 0px;
      margin-right: 10px;
    }

    label {
      cursor: pointer;
    }

  </style>

  <div class="login">
    <input type="text" placeholder="Username" maxlength="6" id="username" name="username" />
    <input type="text" placeholder="Room-ID" maxlength="6" id="Room-ID" name="Room-ID" />
    <input type="submit" value="Join" name="joinButton" />
    <div id="sound">
      <input type="checkbox" id="sound-checkbox" name="sound-checkbox" />
      <label for="sound-checkbox">Sounds</label>
    </div>
  </div>
  `
}

