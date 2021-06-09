# AIM Software Development Kit

The Automation Integration Manager Framework is a development of [Alicon](https://alicon.aliconnect.nl) and designed by [Max van Kampen](https://www.linkedin.com/in/maxvankampen/).

We supply a cloud service on [aliconnect.nl](https://aliconnect.nl) that contains:
1. A data warehouse in the cloud that can preserve a client configurable datamodel. It includes object oriented inheritance for complex breakdown structures.
1. A data management server with OData REST API and WebSocket service for realtime data access by client web applications and services
1. Multifactorauthentication for secure and private data storage for accounts and companies
1. A no-code SaaS client application to work with your persponal and company data

For custom software development we supply:
1. A [API](https://aliconnect.github.io/api/) library for filebased and localhost client applications
1. A [Node](https://aliconnect.github.io/aim/) library for factory and machine control applications with realtime visualisation that run on- or offline
1. An [Software Development Kit](https://aliconnect.github.io/sdk/) for software development with the AIM Framework

Our target is to offer this framework to developers over the world to supply a software development kit that includes a complete webapplication environment that can be extended with custom solutions.

> As for today this Framework is **under construction** and is **not for public use**. Our primairy target is to complete the authentication flow and domain registration. First release is te be expected end august 2021.

# Get started

To get started no software installation is requered. Just go to [aliconnect.nl](https://aliconnect.nl) and [create an account](https://login.aliconnect.nl/?prompt=login&response_type=code&client_id=1-c9b05c80-4d2b-46c1-abfb-0464854dbd9a&redirect_uri=https%3A%2F%2Faliconnect.nl&scope=name%2Cemail%2Cmobile_number). You can now work with your personal data.

**under construction** To share data or work together with others [create a custom domain](https://aliconnect.nl?prompt=domain) with your companyname.

# Get started as a developer

To extend the basic application with custom javascript create your own `index.html` with following code.

```html
<!DOCTYPE html>
<html class="app" dark="1">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>companyname</title>
  <link href="https://aliconnect.nl/api/css/web_debug.css" rel="stylesheet" />
  <script src="https://aliconnect.nl/api/js/aim_debug.js"
          scope="name email"
          --server-url="//companyname.aliconnect.nl/api"
          libraries="web,om,getstarted" ></script>
  <script src="config.js" ></script>
</head>
<body class="col aim om bg" view="rows"></body>
</html>
```

Now extend your application with menu configuration and custom code in your `config.js`

```js
(function(){
  $().extend({
    myFunction() {
      console.log('myFunction is executed');
    }
  })  
})()
```

For more instrcutions see [Software Development Kit](https://aliconnect.github.io/sdk/)
