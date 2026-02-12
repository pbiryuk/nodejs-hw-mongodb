import createHttpError from 'http-errors';
import fs from 'fs/promises';
import multer from 'multer';
import { uploadImage } from '../services/cloudinary.js';
import {
  getAllContactsService,
  getContactByIdService,
  createNewContact,
  updateContactById,
  deleteContactById,
} from '../services/contacts.js';

const upload = multer({ dest: 'tmp/' });

export const getAllContacts = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = req.query;

  const filter = { userId: req.user._id };
  if (type) filter.contactType = type;
  if (isFavourite !== undefined) filter.isFavourite = isFavourite === 'true';

  const result = await getAllContactsService(
    Number(page),
    Number(perPage),
    sortBy,
    sortOrder,
    filter,
  );

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: result,
  });
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactByIdService(contactId, req.user._id);
  if (!contact) throw createHttpError(404, 'Contact not found');

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactWithPhoto = [
  upload.single('photo'),
  async (req, res) => {
    if (req.file) {
      const photoUrl = await uploadImage(req.file.path);
      await fs.unlink(req.file.path);
      req.body.photo = photoUrl;
    }
    const newContact = await createNewContact({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: newContact,
    });
  },
];

export const updateContactWithPhoto = [
  upload.single('photo'),
  async (req, res) => {
    if (req.file) {
      const photoUrl = await uploadImage(req.file.path);
      await fs.unlink(req.file.path);
      req.body.photo = photoUrl;
    }
    const updated = await updateContactById(
      req.params.contactId,
      req.body,
      req.user._id,
    );
    res.json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: updated,
    });
  },
];

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  await deleteContactById(contactId, req.user._id);
  res.status(204).send();
};
