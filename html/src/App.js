import React from 'react';
import './App.css';

async function POST( options = { path:"/", data:{  }  } ){
  let { path, data, } = options;
  let response = await fetch(
      "http://localhost:8080/"+path, 
      {
          method: "POST",
          headers: { 
              "Content-Type": "application/json", 
          },
          body: JSON.stringify(data),
      }
  )
  return response;
}

async function GET( options = { path:"/",  } ){
  let { path } = options;
  let response = await fetch( "http://localhost:8080/"+path, )
  return response;
}

const Camera = (props = { image:undefined, imageState:undefined, userState:undefined, compState:undefined }) =>{

  let height = 480, width = 640;

  let video = React.useRef();
  let canvas = React.useRef();

  let [ stream, streamState ] = React.useState(true);
  let { image, imageState, compState, userState } = props;
  
  function takepicture() {
    var context = canvas.current.getContext('2d');
    canvas.current.width = width;
    canvas.current.height = height;
    context.drawImage(video.current, 0, 0, width, height,);

    video.current.pause();
    imageState(canvas.current.toDataURL('image/png'));
    streamState(false);
  }

  function validate () {
    POST({
      path:"validate",
      data:{
          image:image,
      }
    }).then(response=>response.json()).then(data=>{
      if(data.user){
        imageState(data.roi);
        userState(data.user);
        compState("dashboard");
      }else{
        imageState(data.roi);
        compState("newuser");
      }
    })
  }

  React.useEffect(()=>{
    if (stream){
      navigator.mediaDevices.getUserMedia({ video: true, audio:true }).then(function(stream){
        video.current.srcObject = stream;
        video.current.play();
        window.video = video.current;
      }).catch(function(err){
        console.log(err);
      })
    }
  })

  return (
     <div className="cam">
      { stream ? (
        <div className="camera">
          <div className="title">
            Look At The Camera
          </div>
          <video muted={true} ref={video} > Stream Will Start </video> 
          <button onClick={takepicture} > Take Photo </button>
        </div>
        ) :
        (
          <div className="image">
            <div className="title">
              
            </div>
            <img src={ image } alt={"Hello"} />
            <div>
              <button onClick={validate}> Validate </button>
              &nbsp;&nbsp;&nbsp;
              <button onClick={e=>{ imageState(undefined); streamState(true) }}> New </button>
            </div>
          </div>
        )
      }
      <canvas ref={canvas} />
    </div>
  );
}

const Dashboard  = (props={ 
  user: {
    name : undefined,
    phone : undefined, 
    email : undefined,
    history:[
      {
        date:"1/1/21",
        id:"1290",
        orders:[
          {
            "name":"burger",
            "price":"10$"
          }
        ]
      },
    ]
  },
  image:undefined,
  compState:undefined,
  userState:undefined,
  imageState:undefined
}) => {

  let { user, userState, compState, image, imageState } = props;
  let [ cart, cartState ] = React.useState({

  })
  let [ id, idState ] = React.useState(false);
  

  let items = [
    {
      name:"Burger", 
      price: 10,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger M", 
      price: 20,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger L", 
      price: 30,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger", 
      price: 10,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger M", 
      price: 20,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger L", 
      price: 30,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger", 
      price: 10,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger M", 
      price: 20,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger L", 
      price: 30,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger", 
      price: 10,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger M", 
      price: 20,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger L", 
      price: 30,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger", 
      price: 10,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger M", 
      price: 20,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    },
    {
      name:"Burger L", 
      price: 30,
      image:"https://media.istockphoto.com/photos/fresh-burger-isolated-picture-id1125149183"
    }
  ]

  function addItem(item={ name:"Burger", price:10 }){
    if ( cart[item.name] ){
      cart[item.name].count ++;
    }else{
      cart[item.name] = { ...item, count:1 };
    }
    cartState({ ...cart })
  }

  function goBack(){
    compState("camera");
    userState(undefined);
    imageState(undefined);
    idState(false);
  }

  function order(){
    POST({
      path:'order',
      data:{
        user:user,
        cart:cart
      }
    }).then(response=>response.json()).then(data=>{
      idState(data.id.toString());
    })  
  }

  if (id){
    return (
      <div className="order-id">
        <div>
          Your order id is
        </div>
        <div>
          { id }
        </div>
        <button onClick={goBack}>
          New Order
        </button>
      </div>
    )
  }else {
    return (
      <div className="dashboard">
        <div className="user">
          <div className="photo">
            <img alt="user.png" src={ image } />
          </div>
          <div className="info">
            {
              ['name', 'phone', 'email'].map((key, i)=>{
                return (
                  <div className="prop" key={i}>
                    <div className="key">
                      { key }
                    </div>
                    <div className="val">
                      { user[key] }
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
        <div className="new-order">
          <div className="title">
            New Order
          </div>
          <div className='itemscontainer'> 
            <div className="items">
              {
                items.map((item, i)=>{
                  return (
                    <div className="item" onClick={e=>addItem(item)} key={i}>
                      <div className='image'>
                        <img src={item.image} />
                      </div>
                      <div className="info" >
                        <div className="name">
                          { item.name }
                        </div>
                        <div className="price">
                          { item.price } $
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
          <div className="itemscontainer">
            <div className="items cart">
            {
                Object.keys(cart).map((item, i)=>{
                  item = cart[item];
                  return (
                    <div className="item" key={i} >
                      <div className='image'>
                        <img src={item.image} />
                      </div>
                      <div className="info" >
                        <div className="name">
                          { item.count }
                        </div>
                        <div className="price">
                          { ( item.count * item.price ) } $
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div> 
          <div className='order-btns'>
            <div className="btn" onClick={order}>
              Order
            </div>
            <div className="btn" onClick={goBack}>
              Cancel
            </div>
          </div>
        </div>
        <div className="history">
            <div className="title">
              History 
            </div>
            <div className="data">
              {
                user.history.map(( row, i )=>{
                  return (
                    <div className="record" key={i} >
                      <div className="date">
                        Date : { row.date } | Id : { row.id }
                      </div>
                      <div className="orders">
                        <div className="order" >
                          <div className="name">
                            Name
                          </div>  
                          <div className="price">
                            Price
                          </div>
                        </div>
                        {
                          row.orders.map((order,j)=>{
                            return (
                              <div className="order" key={j} >
                                <div className="name">
                                  { order.name }
                                </div>  
                                <div className="price">
                                  { ( order.price * order.count ) } $
                                </div>
                              </div>
                            )
                          })
                        }
                      </div>
                    </div>    
                  )
                })
              }
            </div>
        </div>
      </div>
    ) 
  }

}

const NewUser = (props) =>{
  let [newuser, newuserState] = React.useState({
    name:"Username",
    phone:"User Phone Number",
    email:"Email"
  })
  let { image, userState, imageState, compState } = props;

  function addUser(){
    POST({
      path:'newuser',
      data:{
        user:newuser,
        photo:image,
      }
    }).then(response=>response.json()).then(data=>{
      userState(data.user)
      compState("dashboard")
    })
  }

  function cancel(){
    userState({})
    imageState(undefined)
    compState("camera")
  }

  return (
    <div className="new-user">
      <div className="photo">
        <img src={image} alt="user.png" />
      </div>
      <div className="form">
        {
          Object.keys(newuser,).map((field, i)=>{
            return (
              <div className="input" key={i}>
                <div className="name">
                  { field }
                </div>
                <div className="field">
                  <input  defaultValue={newuser[field]} onChange={e=>{
                    newuser[field] = e.target.value;
                    newuserState({
                      ...newuser
                    })
                  }} />
                </div>
              </div>
            )
          })
        }
        <button onClick={addUser}>
          Add
        </button>
        <button onClick={cancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}

const App = (props) => {
  let [ image, imageState ] = React.useState(undefined);
  let [ user, userState ] = React.useState({
    name : undefined,
    phone : undefined, 
    email : undefined
  })
  let [ comp, compState  ] = React.useState("camera");

  switch ( comp ) {
    case "camera":
      return (
        <div className="app">
          <Camera 
            image={image} 
            imageState={imageState} 
            compState={compState} 
            userState={userState}  
          />
        </div>
      )
    case "dashboard":
      return (
        <div className="app">
          <Dashboard 
            image={image} 
            user={user}
            userState={userState}
            imageState={imageState} 
            compState={compState} 
          />
        </div>
      ) 
    case "newuser":
      return (
        <div className="app">
          <NewUser
            image={image} 
            imageState={imageState} 
            compState={compState} 
            userState={userState}
          />
        </div>
      ) 
    default:
      return (
        <div className="app">
          <Camera image={image} imageState={imageState} compState={compState} />
        </div>
      )
  }
    
}

export default App;
