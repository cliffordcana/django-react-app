import React, { Component } from 'react';
import axios from 'axios';
import { itemDetailURL, addToCartURL } from '../endpoints';

import {
    Button,
    Card,
    Container,
    Dimmer,
    Grid,
    Label,
    Loader,
    Message,
    Segment,
} from "semantic-ui-react";

import { authAxios } from '../utils';
import { fetchCart } from "../store/actions/cart";
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';

class ItemDetail extends Component {
    state = {
        loading: false,
        error: null,
        data: [],          
        formData: {}
    };

    componentDidMount() {
        this.handleFetchItem();
    }

    

    handleFetchItem = () => {
        const { match: { params } } = this.props;

        this.setState({ loading: true });
        axios.get(itemDetailURL(params.itemID))
        .then(res => {
            this.setState({ data: res.data, loading: false });
        })
        .catch(err => {
            this.setState({ error: err, loading: false });
            console.log(err)
        });
    };


    handleAddToCart = slug => {
        this.setState({ loading: true });        
        authAxios.post(addToCartURL, { slug })
        .then(res => {
            this.props.refreshCart();
            this.setState({ loading: false })
        });
    };


    render() {
        const { data, error, loading } = this.state;
        const item = data;
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
            <Grid columns={2} divided>
            <Grid.Row>
                <Grid.Column>
                <Card
                    fluid
                    image={item.image}
                    header={item.title}
                    meta={
                    <React.Fragment>
                        {item.category}
                        {item.discount_price && (
                        <Label
                            color={
                            item.label === "Rare"
                                ? "blue"
                                : item.label === "Limited"
                                ? "green"
                                : "olive"
                            }
                        >
                            {item.label}
                        </Label>
                        )}
                    </React.Fragment>
                    }
                    description={item.description}
                    extra={
                    <React.Fragment>
                        <Link to='/'>
                        <Button
                        
                        color="purple"
                        floated="right"
                        icon="arrow left"
                        labelPosition="right"
                        onClick={this.handleToggleForm}
                        >
                        Go back to cart
                        </Button>
                        </Link>
                    </React.Fragment>
                    }
                />
                </Grid.Column>
            </Grid.Row>
            </Grid>
        </Container>
        );
    }
}


const mapDispatchToProps = dispatch => {
    return {
        refreshCart: () => dispatch((fetchCart))
    };
};

export default withRouter(connect(null, mapDispatchToProps)(ItemDetail));