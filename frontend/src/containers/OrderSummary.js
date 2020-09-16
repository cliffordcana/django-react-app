import React, { Component } from "react";
import {
    Container,
    Dimmer,
    Header,
    Icon,
    Image,
    Label,
    Loader,
    Table,
    Button,
    Message,
    Segment
} from "semantic-ui-react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import { authAxios } from "../utils";
import { addToCartURL, orderSummaryURL, orderItemDeleteURL, removeFromCartURL } from '../endpoints';

class OrderSummary extends Component {
    state = {
        data: null,
        error: null,
        loading: false
    };

    componentDidMount() {
        this.handleFetchOrder();
    }

    handleFetchOrder = () => {
        this.setState({ loading: true });
        authAxios.get(orderSummaryURL)
        .then(res => {
            this.setState({ data: res.data, loading: false });
        })
        .catch(err => {
            if (err.response.status === 404) {
                this.setState({ error: 'you do not have an order', loading: false});
            } else { 
                this.setState({ error: err, loading: false });
            }
        });
    }


    handleAddToCart = slug => {
        this.setState({ loading: true });
        authAxios.post(addToCartURL, { slug })
        .then(res => {
            this.handleFetchOrder();
            this.setState({ loading: false });
        })
        .catch(err => {
            this.setState({ error: err, loading: false });
        });
    };

    handleRemoveFromCart = slug => {
        authAxios.post(removeFromCartURL, { slug })
        .then(res => {
            this.handleFetchOrder();
        })
        .catch(err => {
            this.setState({ error: err });
        });
    };

    handleDeleteItem = itemID => {
        authAxios.delete(orderItemDeleteURL(itemID))
        .then(res => {
            this.handleFetchOrder();
        })
        .catch(err => {
            this.setState({ error: err });
        });
    };

    render() {
        const { data, error, loading } = this.state;
        const { isAuthenticated } = this.props;
        if (!isAuthenticated) {
            return <Redirect to="/login" />;
        }
        console.log(data);

        return (
            <Container>
            <Header>Order Summary</Header>
            {error && (
                <Message
                error
                header="There was an error"
                content={JSON.stringify(error)}
                />
            )}
            {loading && (
                <Segment>
                <Dimmer active inverted>
                    <Loader inverted>Loading</Loader>
                </Dimmer>

                <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
                </Segment>
            )}
            {data && (
                <Table celled>
                <Table.Header>
                    <Table.Row>
                    <Table.HeaderCell>Item #</Table.HeaderCell>
                    <Table.HeaderCell>Item name</Table.HeaderCell>
                    <Table.HeaderCell>Item price</Table.HeaderCell>
                    <Table.HeaderCell>Item quantity</Table.HeaderCell>
                    <Table.HeaderCell>Total item price</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {data.order_items.map((orderItem, i) => {
                    return (
                        <Table.Row key={orderItem.id}>
                        <Table.Cell>{i + 1}</Table.Cell>
                        <Table.Cell>
                            {orderItem.item.title} {" "}
                    
                        </Table.Cell>
                        <Table.Cell>Php {orderItem.item.price}</Table.Cell>
                        <Table.Cell textAlign="center">
                            <Icon
                            name="minus"
                            style={{ float: "left", cursor: "pointer" }}
                            onClick={() =>
                                this.handleRemoveFromCart(orderItem.item.slug)
                            }
                            />
                            {orderItem.quantity}
                            <Icon
                            name="plus"
                            style={{ float: "right", cursor: "pointer" }}
                            onClick={() =>
                                this.handleAddToCart(
                                orderItem.item.slug,
                                )
                            }
                            />
                        </Table.Cell>
                        <Table.Cell>
                            {orderItem.item.discount_price && (
                            <Label color="green" ribbon>
                                ON DISCOUNT
                            </Label>
                            )}
                            Php {orderItem.final_price}
                            <Icon
                            name="trash"
                            color="red"
                            style={{ float: "right", cursor: "pointer" }}
                            onClick={() => this.handleDeleteItem(orderItem.id)}
                            />
                        </Table.Cell>
                        </Table.Row>
                    );
                    })}
                    <Table.Row>
                    <Table.Cell />
                    <Table.Cell />
                    <Table.Cell />
                    <Table.Cell textAlign="right" colSpan="2">
                        Order Total: Php {data.total}
                    </Table.Cell>
                    </Table.Row>
                </Table.Body>

                <Table.Footer>
                    <Table.Row>
                    <Table.HeaderCell colSpan="5">
                        <Link to="/checkout">
                        <Button floated="right" color="yellow">
                            Checkout
                        </Button>
                        </Link>
                    </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
                </Table>
            )}
            </Container>
        );
    }
}

const mapStateToProps = state => {
    return {
        isAuthenticated: state.auth.token !== null
    };
};

export default connect(mapStateToProps)(OrderSummary);