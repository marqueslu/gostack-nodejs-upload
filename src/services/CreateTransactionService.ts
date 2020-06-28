// import AppError from '../errors/AppError';

import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionReposiory = getCustomRepository(TransactionsRepository);

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Invalid type');
    }

    const { total } = await transactionReposiory.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError(`Your outcome is greather than the total amount.`);
    }

    let existentCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!existentCategory) {
      existentCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(existentCategory);
    }

    const transaction = transactionReposiory.create({
      title,
      value,
      type,
      category_id: existentCategory.id,
    });

    await transactionReposiory.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
