import React from "react";
import { Route } from "react-router-dom";


import Login from "./containers/Login";
import Signup from "./containers/Signup";
import ItemList from "./containers/ItemList";
import ItemDetail from "./containers/ItemDetail";
import OrderSummary from "./containers/OrderSummary";
import Checkout from "./containers/Checkout";

const BaseRouter = () => (
    <div>
        <Route exact path="/" component={ItemList} />
        <Route path="/items/:itemID" component={ItemDetail} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/order-summary" component={OrderSummary} />
        <Route path="/checkout" component={Checkout} />
        
    </div>
);

export default BaseRouter;