import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contactsValidation.js';
import {
  getAllContacts,
  getContactById,
  createContactWithPhoto,
  updateContactWithPhoto,
  deleteContact,
} from '../controllers/contacts.js';

const router = express.Router();

router.use(authenticate);

router.get('/', ctrlWrapper(getAllContacts));
router.get('/:contactId', isValidId, ctrlWrapper(getContactById));

// Використовуємо розпаковку масиву middleware для фото
router.post('/', validateBody(createContactSchema), ...createContactWithPhoto);

router.patch(
  '/:contactId',
  isValidId,
  validateBody(updateContactSchema),
  ...updateContactWithPhoto,
);

router.delete('/:contactId', isValidId, ctrlWrapper(deleteContact));

export default router;
