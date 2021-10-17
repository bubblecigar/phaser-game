import gameConfig from '../../game/config'

export const generateInputForm = () => {

  const width = `40%`
  const height = gameConfig.canvasHeight * 0.8
  const marginTop = gameConfig.canvasHeight * 0.2

  return `
  <style>
    .login {
      height: ${height}px;
      margin: ${marginTop}px auto 0;
      width: 100%;
      transform: scale(.5);
    }

    input[type="Room-ID"],
    input[type="text"] {
      background: linear-gradient(top, #d6d7d7, #dee0e0);
      border: 1px solid #a1a3a3;
      border-radius: 4px;
      box-shadow: 0 1px #fff;
      box-sizing: border-box;
      color: #696969;
      height: 39px;
      margin: 31px 0 0 29px;
      padding-left: 20px;
      transition: box-shadow 0.3s;
      width: ${width};
    }

    input[type="Room-ID"]:focus,
    input[type="text"]:focus {
      box-shadow: 0 0 4px 1px rgba(55, 166, 155, 0.3);
      outline: 0;
    }

    .show-password {
      display: block;
      height: 16px;
      margin: 26px 0 0 28px;
      width: 87px;
    }

    input[type="checkbox"] {
      cursor: pointer;
      height: 16px;
      opacity: 0;
      position: relative;
      width: 64px;
    }

    input[type="checkbox"]:checked {
      left: 29px;
      width: 58px;
    }

    .toggle {
      display: block;
      height: 16px;
      margin-top: -20px;
      width: 87px;
      z-index: -1;
    }

    input[type="checkbox"]:checked+.toggle {
      background-position: 0 -16px
    }

    input[type="submit"] {
      width: 89%;
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
      margin: 29px 0 0 29px;
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
  </style>

  <div class="login">
    <input type="text" placeholder="Username" id="username" name="username">
    <input type="Room-ID" placeholder="Room-ID" id="Room-ID" name="Room-ID">
    <input type="submit" value="Join" name="joinButton">
  </div>
  `
}

