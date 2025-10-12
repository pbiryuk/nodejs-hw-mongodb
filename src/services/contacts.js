import createHttpError from 'http-errors';
import Contact from '../models/contact.js';

export const getAllContactsService = async () => Contact.find();

export const getContactByIdService = async (contactId) =>
  Contact.findById(contactId);

export const createNewContact = async (contactData) =>
  Contact.create(contactData);

export const updateContactById = async (contactId, data) => {
  const contact = await Contact.findByIdAndUpdate(contactId, data, {
    new: true,
    runValidators: true,
  });

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  return contact;
};

export const deleteContactById = async (contactId) => {
  const contact = await Contact.findByIdAndDelete(contactId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  return contact;
};
