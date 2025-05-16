import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL_BASE_API;
 

export function SignIn() {

  // console.log("process ", apiUrl)
  // call api
  const [getFormDataError, setGetFormDataError] = useState({
    "password": false,
    "email": false
  })
  const [usernameVar, setUsernameVar] = useState("")
  const [passwordVar, setPasswordVar] = useState("")
  const [loader, setLoader] = useState("<div></div")
  const [login, setLogin] = useState("Login")
  const [loginError, setLoginError] = useState("")


  useEffect(() => {
    // Clear history when component mounts
    clearTabHistory();    
  }, []);

  function clearTabHistory() {
    const currentUrl = window.location.href;
    window.history.pushState(null, "", currentUrl);
    window.onpopstate = function (event) {
      window.history.go(1);
    };
  }

  function CheckLogin(e){
    e.preventDefault();    

    // console.log("fff", process.env.REACT_APP_BASE_API, passwordVar, usernameVar)
    if (usernameVar === "") {
      setGetFormDataError({ ...getFormDataError, ...{ "email": true } })
    }
    else if (passwordVar === "") {
      setGetFormDataError({ ...getFormDataError, ...{ "password": true } })

    }
    else {
      setLogin("")
      setLoader('<div class="spinner-border "style="color: #e0922f;"></div>`')
      // console.log(" login ")

      const formData = new FormData();
      formData.append('username', usernameVar)
      formData.append('password', passwordVar)

      let config = {
        method: 'post',
        url: apiUrl + "/login/user",
        maxBodyLength: Infinity,
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'      
        },
        data: formData
      };
      axios.request(config).then(response => {
        // console.log(response.status, "auth ");

        if(response?.status === 200){
          let permission_list = ['MERCHANT_ADMIN', 'SUPER_ADMIN']
          let counter = 600000; // 600000 = 10m
          let userData = response?.data;
          userData = {...userData, ...response?.data, ...{ counter: counter, sessiomTime: counter}, ...{permission_list: permission_list}, ...{"timeLogout": new Date(new Date().getTime() + counter)}}

          // console.log(userData); timeLogout
          localStorage.setItem("userDataStore", JSON.stringify(userData));

        if(response?.data?.user?.must_change_password){
          // window.location.href = "/change-password";
        }
        else{
          setTimeout(() => {
            window.location.href = "/dashboard/home";
          }, 1000)
        }

      }

      }).catch(function (error) {

        if (error.response) {
          // console.log("==>", error.response?.data?.detail);

          setLoader("<a></a>")
          setLogin("Login")
          setLoginError(`Wrong user credentials: ${error?.response?.data?.detail}`)
          /*
            * The request was made and the server responded with a
            * status code that falls out of the range of 2xx
            */

        } else if (error.request) {

          setLoader("<a></a>")
          setLogin("Login")
          setLoginError("Wrong user credentials")
          /*
            * The request was made but no response was received, `error.request`
            * is an instance of XMLHttpRequest in the browser and an instance
            * of http.ClientRequest in Node.js
            */

        } else {
          // Something happened in setting up the request and triggered an Error

        }
      }
      );

    }

  }
  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Sign In</Typography>
          {/* <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter your email and password to Sign In.</Typography> */}
        </div>
        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onChange={(e)=>{setUsernameVar(e.target.value), setLoginError("")}}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onChange={(e)=>{setPasswordVar(e.target.value), setLoginError("")}}
            />
          </div>
          
          <Button className="mt-6" fullWidth onClick={(e)=>CheckLogin(e)} >
            Sign In
          </Button>

          <p className="mt-3 my-0 mx-0" style={{color: "red"}} >
            {loginError}
          </p>

        </form>

      </div>
      <div className="w-3/5 h-full hidden lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full object-cover rounded-3xl mt-0"
        />
      </div>

    </section>
  );
}

export default SignIn;
