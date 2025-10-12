import createHttpError from 'http-errors';
import Contact from '../models/contact.js';

export const getAllContactsService = async (
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  filter = {},
) => {
  const skip = (page - 1) * perPage;

  const totalItems = await Contact.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / perPage);

  const contacts = await Contact.find(filter)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(perPage);

  return {
    data: contacts,
    page,
    perPage,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

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
