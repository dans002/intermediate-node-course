const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	name: {type: String, required: true},
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true},
    address: {type: mongoose.Schema.Types.ObjectId, ref:'Address'}
});

const AddressSchema = new mongoose.Schema({
    postcd: {type: Number, require: true},
    room: {type: String}
});

const User = mongoose.model('User', UserSchema);
const Address = mongoose.model('Address', AddressSchema);

module.exports.User = User;
module.exports.Address = Address;
