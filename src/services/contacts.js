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
  const totalPages = Math.ceil(totalItems / perPage) || 1;

  const allowedSortFields = ['name', 'email', 'phoneNumber', 'createdAt'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';

  const contacts = await Contact.find(filter)
    .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(perPage)
    .lean();

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

export const getContactByIdService = async (contactId, userId) =>
  Contact.findOne({ _id: contactId, userId });

export const createNewContact = async (contactData) =>
  Contact.create(contactData);

export const updateContactById = async (contactId, data, userId) => {
  const contact = await Contact.findOneAndUpdate(
    { _id: contactId, userId },
    data,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!contact) throw createHttpError(404, 'Contact not found');
  return contact;
};

export const deleteContactById = async (contactId, userId) => {
  const contact = await Contact.findOneAndDelete({ _id: contactId, userId });
  if (!contact) throw createHttpError(404, 'Contact not found');
};
