import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import {
    Container,
    Dimmer,
    Item,
    Label,
    Loader,
    Message,
    Segment,
    Button,
    Icon
} from "semantic-ui-react";
import { itemListURL, addToCartURL } from "../endpoints";
import { fetchCart } from "../store/actions/cart";
import { authAxios } from "../utils";

class ItemList extends Component {
    state = {
        loading: false,
        error: null,
        data: []
    };

    componentDidMount() {
        this.setState({ loading: true });
        axios.get(itemListURL)
        .then(res => {
            this.setState({ data: res.data, loading: false });
        })
        .catch(err => {
            this.setState({ error: err, loading: false });
        });
    }

    handleAddToCart = slug => {
        this.setState({ loading: true });
        authAxios
        .post(addToCartURL, { slug })
        .then(res => {
            this.props.refreshCart();
            this.setState({ loading: false });
        })
        .catch(err => {
            this.setState({ error: err, loading: false });
        });
    };

    render() {
        const { data, error, loading } = this.state;
        return (
        <Container>
            {error && (
            <Message error content={console.log(JSON.stringify(error))}/>
            )}
            {loading && (
            <Segment>
                <Dimmer active inverted>
                <Loader inverted>Loading</Loader>
                </Dimmer>
            </Segment>
            )}
            <Item.Group divided>
            {data.map(item => {
                return (
                <Item key={item.id}>
                    <Item.Image src={item.image} />
                    <Item.Content>
                    <Item.Header
                        as="a"
                        onClick={() =>
                        this.props.history.push(`/items/${item.id}`)
                        }
                    >
                        {item.title}
                    </Item.Header>
                    <Item.Meta>
                        <span className="cinema">{item.category}</span>
                    </Item.Meta>
                    <Item.Description>{item.description}</Item.Description>
                    <Item.Extra>
                        { <Button
                        primary
                        floated="right"
                        icon
                        labelPosition="right"
                        onClick={() => this.handleAddToCart(item.slug)}
                        >
                        Add to cart
                        <Icon name="cart plus" />
                        </Button> }
                        {item.discount_price && (
                        <Label
                            color={
                            item.label === "Rare"
                                ? "purple"
                                : item.label === "Limited"
                                ? "yellow"
                                : "olive"
                            }
                        >
                            {item.label}
                        </Label>
                        )}
                    </Item.Extra>
                    </Item.Content>
                </Item>
                );
            })}
            </Item.Group>
        </Container>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        refreshCart: () => dispatch(fetchCart())
    };
};

export default connect(null, mapDispatchToProps)(ItemList);