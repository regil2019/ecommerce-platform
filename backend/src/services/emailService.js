import emailjs from '@emailjs/nodejs';

const serviceID = process.env.EMAILJS_SERVICE_ID;
const publicKey = process.env.EMAILJS_PUBLIC_KEY;
const privateKey = process.env.EMAILJS_PRIVATE_KEY;

const templates = {
  orderConfirmation: process.env.EMAILJS_ORDER_CONFIRMATION_TEMPLATE,
  welcome: process.env.EMAILJS_WELCOME_TEMPLATE,
  orderStatusUpdate: process.env.EMAILJS_ORDER_STATUS_UPDATE_TEMPLATE,
  passwordReset: process.env.EMAILJS_PASSWORD_RESET_TEMPLATE,
};

export const sendOrderConfirmationEmail = async (toEmail, orderData) => {
  try {
    const templateParams = {
      to_email: toEmail,
      order_id: orderData.id,
      order_date: orderData.createdAt,
      total_amount: orderData.totalAmount,
      items: orderData.items.map(item => `${item.product.name} x${item.quantity}`).join(', '),
      customer_name: orderData.user.name,
    };

    await emailjs.send(serviceID, templates.orderConfirmation, templateParams, {
      publicKey,
      privateKey,
    });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (toEmail, userData) => {
  try {
    const templateParams = {
      to_email: toEmail,
      user_name: userData.name,
      user_email: userData.email,
    };

    await emailjs.send(serviceID, templates.welcome, templateParams, {
      publicKey,
      privateKey,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

export const sendOrderStatusUpdateEmail = async (toEmail, orderData, newStatus) => {
  try {
    const templateParams = {
      to_email: toEmail,
      order_id: orderData.id,
      new_status: newStatus,
      customer_name: orderData.user.name,
    };

    await emailjs.send(serviceID, templates.orderStatusUpdate, templateParams, {
      publicKey,
      privateKey,
    });
  } catch (error) {
    console.error('Error sending order status update email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (toEmail, resetToken) => {
  try {
    const templateParams = {
      to_email: toEmail,
      reset_link: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
    };

    await emailjs.send(serviceID, templates.passwordReset, templateParams, {
      publicKey,
      privateKey,
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};