import React, { Component } from "react";
import {
    Container,
    Dropdown,
    Grid,
    Header,
    Menu,
    Segment
} from "semantic-ui-react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { logout } from "../store/actions/auth";
import { fetchCart } from "../store/actions/cart";

class CustomLayout extends Component {
    componentDidMount() {
        this.props.fetchCart();
    }

    render() {
        const { authenticated, cart, loading } = this.props;
        return (
        <div>
            <Menu inverted color="purple">
            <Container>
                <Link to="/">
                <Menu.Item header>Store</Menu.Item>
                </Link>
                {authenticated ? (
                <React.Fragment>
                    <Menu.Menu position="right">
                    <Dropdown
                        icon="cart"
                        loading={loading}
                        text={`${cart !== null ? cart.order_items.length : 0}`}
                        pointing
                        className="link item"
                    >
                        <Dropdown.Menu>
                        {cart !== null ? (
                            <React.Fragment>
                            {cart.order_items.map(order_item => {
                                return (
                                <Dropdown.Item key={order_item.id}>
                                    {order_item.quantity} x {order_item.item.title}
                                </Dropdown.Item>
                                );
                            })}
                            {cart.order_items.length < 1 ? (
                                <Dropdown.Item>No items in your cart</Dropdown.Item>
                            ) : null}
                            <Dropdown.Divider />

                            <Dropdown.Item
                                icon="arrow right"
                                text="Checkout"
                                onClick={() =>
                                this.props.history.push("/order-summary")
                                }
                            />
                            </React.Fragment>
                        ) : (
                            <Dropdown.Item>No items in your cart</Dropdown.Item>
                        )}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Menu.Item header onClick={() => this.props.logout()}>
                        Logout
                    </Menu.Item>
                    </Menu.Menu>
                </React.Fragment>
                ) : (
                <Menu.Menu position="right">
                    <Link to="/login">
                    <Menu.Item header>Login</Menu.Item>
                    </Link>
                    <Link to="/signup">
                    <Menu.Item header>Signup</Menu.Item>
                    </Link>
                </Menu.Menu>
                )}
            </Container>
            </Menu>

            {this.props.children}

            <Segment
            inverted
            vertical
            style={{ margin: "5em 0em 0em", padding: "5em 0em" }} color="purple"
            >
            <Container textAlign="center">
                <Grid.Column width={7}>
                    <Header inverted as="h4" content="DISCLAIMER" />
                    <p>This is only a test site. You may use 1@email.com with password 1 to test the add to cart functionality or sign up, 4242 4242 4242 4242 for
                        the cc: no., and any valid exp. date and cvc. You may also add a coupon code 1.</p>
                </Grid.Column>
            </Container>
            </Segment>
        </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        authenticated: state.auth.token !== null,
        cart: state.cart.shoppingCart,
        loading: state.cart.loading,
        
    };
};

const mapDispatchToProps = dispatch => {
    return {
        logout: () => dispatch(logout()),
        fetchCart: () => dispatch(fetchCart())
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CustomLayout));