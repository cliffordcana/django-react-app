const localhost = "http://127.0.0.1:8000";

const apiURL = "/api";

export const endPoint = `${localhost}${apiURL}`;

export const itemListURL = `${endPoint}/items/`;
export const itemDetailURL = id => `${endPoint}/items/${id}/`;
export const addToCartURL = `${endPoint}/add-to-cart/`;
export const orderSummaryURL = `${endPoint}/order-summary/`;
export const addCouponURL = `${endPoint}/add-coupon/`;
export const orderItemDeleteURL = id => `${endPoint}/order-items/${id}/delete/`;
export const removeFromCartURL = `${endPoint}/remove-from-cart/`;

