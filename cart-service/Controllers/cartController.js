const Cart = require('../Models/Cart');
const axios = require('axios');
const mongoose = require('mongoose');

exports.addToCart = async (req, res) => {
    try {
      const url = `mongodb+srv://${process.env.db_username}:${process.env.db_password}@ecom-avito-project-clus.omnkh3d.mongodb.net/${process.env.db_name}`;
      await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000
      });
  
      const { annonceId, quantity } = req.body;
      const userId=req.userId;
  
      const adDetailsResponse = await axios.get(`http://localhost:8001/annonces/${annonceId}`);
      const adDetails = adDetailsResponse.data;
  
      if (!adDetails) {
        return res.status(404).json({ message: 'Annonce not found' });
      }
  
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        cart = new Cart({ userId, annonces: [{ annonce: adDetails, quantity }] });
      } else {
        const existingAdIndex = cart.annonces.findIndex(ad => ad.annonce._id === annonceId);
        if (existingAdIndex !== -1) {
          cart.annonces[existingAdIndex].quantity += Number(quantity);
        } else {
          cart.annonces.push({ annonce: adDetails, quantity });
        }
      }
  
      await cart.save();
      res.status(201).json({ message: 'Annonce added to cart successfully', cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.getCart = async (req, res) => {
    try {
      const url = `mongodb+srv://${process.env.db_username}:${process.env.db_password}@ecom-avito-project-clus.omnkh3d.mongodb.net/${process.env.db_name}`;
      await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000
      });

      const userId=req.userId;
  
      const cart = await Cart.findOne({ userId });
  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
  
      res.status(200).json({ cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.removeFromCart = async (req, res) => {
    try {
        const url = `mongodb+srv://${process.env.db_username}:${process.env.db_password}@ecom-avito-project-clus.omnkh3d.mongodb.net/${process.env.db_name}`;
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000
        });

        const userId = req.userId;
        const { annonceId } = req.body;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.annonces = cart.annonces.filter(item => item.annonce._id !== annonceId);

        await cart.save();
        res.status(200).json({ message: 'Annonce removed from cart successfully', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.clearCart = async (req, res) => {
  try {
    const url = `mongodb+srv://${process.env.db_username}:${process.env.db_password}@ecom-avito-project-clus.omnkh3d.mongodb.net/${process.env.db_name}`;
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });

    const userId = req.params.id_buyer;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.annonces = [];

    await cart.save();
    res.status(200).json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { annonceId, quantity } = req.body;
    const userId = req.params.id_buyer;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const existingAdIndex = cart.annonces.findIndex(item => item.annonce._id.toString() === annonceId);
    if (existingAdIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    cart.annonces[existingAdIndex].quantity = quantity;

    await cart.save();
    res.status(200).json({ message: 'Quantity updated successfully', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
