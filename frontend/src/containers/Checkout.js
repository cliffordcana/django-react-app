import React, { Component } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, ElementsConsumer } from "@stripe/react-stripe-js";
import {
    Button,
    Container,
    Dimmer,
    Divider,
    Form,
    Header,
    Item,
    Label,
    Loader,
    Message,
    Segment,
} from "semantic-ui-react";
import { Link, withRouter } from "react-router-dom";
import { authAxios } from "../utils";
import {
    orderSummaryURL,
    addCouponURL,
} from "../endpoints";

const OrderPreview = props => {
    const { data } = props;
    return (
        <React.Fragment>
        {data && (
            <React.Fragment>
            <Item.Group relaxed>
                {data.order_items.map((orderItem, i) => {
                return (
                    <Item key={i}>
                    <Item.Image
                        size="tiny"
                        src={`http://127.0.0.1:8000${orderItem.item.image}`}
                    />
                    <Item.Content verticalAlign="middle">
                        <Item.Header as="a">
                        {orderItem.quantity} x {orderItem.item.title}
                        </Item.Header>
                        <Item.Extra>
                        <Label>Php {orderItem.final_price}</Label>
                        </Item.Extra>
                    </Item.Content>
                    </Item>
                );
                })}
            </Item.Group>

            <Item.Group>
                <Item>
                <Item.Content>
                    <Item.Header>
                    Order Total: Php {data.total}
                    {data.coupon && (
                        <Label color="green" style={{ marginLeft: "10px" }}>
                        Current coupon: {data.coupon.code} for Php
                        {data.coupon.amount}
                        </Label>
                    )}
                    </Item.Header>
                </Item.Content>
                </Item>
            </Item.Group>
            </React.Fragment>
        )}
        </React.Fragment>
    );
    };

class CouponForm extends Component {
    state = {
        code: ""
    };

    handleChange = e => {
        this.setState({
        code: e.target.value
        });
    };

    handleSubmit = e => {
        const { code } = this.state;
        this.props.handleAddCoupon(e, code);
        this.setState({ code: "" });
    };

    render() {
        const { code } = this.state;
        return (
        <React.Fragment>
            <Form onSubmit={this.handleSubmit}>
            <Form.Field>
                <label>Coupon code</label>
                <input
                placeholder="Enter a coupon.."
                value={code}
                onChange={this.handleChange}
                />
            </Form.Field>
            <Button type="submit">Submit</Button>
            </Form>
        </React.Fragment>
        );
    }
}

class CheckoutForm extends Component {
    state = {
        data: null,
        loading: false,
        error: null,
        success: false,
    };

    componentDidMount() {
        this.handleFetchOrder();
    }

    handleFetchOrder = () => {
        this.setState({ loading: true });
        authAxios
        .get(orderSummaryURL)
        .then(res => {
            this.setState({ data: res.data, loading: false });
        })
        .catch(err => {
            if (err.response.status === 404) {
            this.props.history.push("/");
            } else {
            this.setState({ error: err, loading: false });
            }
        });
    };

    handleAddCoupon = (e, code) => {
        e.preventDefault();
        this.setState({ loading: true });
        authAxios
        .post(addCouponURL, { code })
        .then(res => {
            this.setState({ loading: false });
            this.handleFetchOrder();
        })
        .catch(err => {
            this.setState({ error: err, loading: false });
        });
    };

    handleSelectChange = (e, { name, value }) => {
        this.setState({ [name]: value });
    };

    submit = ev => {
        ev.preventDefault();
        this.setState({ loading: true });
        const { stripe, elements } = this.props;
        if (!stripe || !elements) {
            return;
        }
        const card = elements.getElement(CardElement);
        if (this.props.stripe) {
            this.props.stripe.createToken(card) /*  const {paymentMethod, error} = await 
            stripe.createPaymentMethod({ type: 'card',
                                    card: card
                                });
                                */
            .then(result => {
                if (result.error) {
                    this.setState({ error: result.error.message, loading: false });
                } else {
                    this.setState({ error: null });
                    authAxios
                    .post('https://jsonplaceholder.typicode.com/posts')
                    .then(res => {
                        this.setState({ loading: false, success: true });
                    })
                    .catch(err => {
                        this.setState({ loading: false, error: err });
                    });
                }
            });
            } else {
                console.log("Stripe is not loaded");
            }
        };

    render() {
        const {
        data,
        error,
        loading,
        success,
        } = this.state;

        return (
        <div>
            {error && (
            <Message
                error
                header="There was some errors with your submission"
                content={JSON.stringify(error)}
            />
            )}
            {loading && (
            <Segment>
                <Dimmer active inverted>
                <Loader inverted>Loading</Loader>
                </Dimmer>
                
            </Segment>
            )}

            <OrderPreview data={data} />
            <Divider />
            <CouponForm
            handleAddCoupon={(e, code) => this.handleAddCoupon(e, code)}
            />
            <React.Fragment>
                <Header>Would you like to complete the purchase?</Header>
                <CardElement />
                {success && (
                <Message positive>
                    <Message.Header>Thank you for purchasing</Message.Header>
                    <p>
                    Shop<Link to='/'> more </Link>to the store.
                    </p>
                </Message>
                )}
                <Button
                loading={loading}
                disabled={loading}
                primary
                onClick={this.submit}
                style={{ marginTop: "10px" }}
                >
                Submit
                </Button>
            </React.Fragment>

        </div>
        );
    }
}

const InjectedCheckoutForm = () => (
    <ElementsConsumer>
        {({stripe, elements}) => (
            <CheckoutForm stripe={stripe} elements={elements} />
        )}
        </ElementsConsumer>
    );
    
const stripePromise = loadStripe('pk_test_51HMnERK6GkQyan6GIC8wT1ofaNoOfu8rVhqymz4AamDbJshHdb79iVoN8PDaSVctjPGnyiiIZC05EYncUCcJEkh300KWjUhWgw');

const WrappedForm = () => (
    <Container text>
        <div>
            <h1>Complete your order</h1>
            <Elements stripe={stripePromise}>
                <InjectedCheckoutForm />
            </Elements>
        </div>
    </Container>
);

export default withRouter(WrappedForm);