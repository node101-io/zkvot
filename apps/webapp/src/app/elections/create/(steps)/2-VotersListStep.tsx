'use client';

import { useState, KeyboardEvent } from 'react';
import Image from 'next/image.js';
import ChevronDownIcon from '@heroicons/react/solid/ChevronDownIcon.js';

import { types } from 'zkvot-core';

import Button from '@/app/(partials)/Button.jsx';

import PlusIcon from '@/public/CreateElection/PlusIcon.svg';
import DeleteIcon from '@/public/CreateElection/DeleteIcon.svg';
import EditIcon from '@/public/CreateElection/EditIcon.svg';

const WalletItem = ({
  index,
  walletData,
  wallets,
  setWallets,
  requiredFields = [],
  customOptionNames = {},
}: {
  index: number;
  walletData: types.Voter;
  wallets: types.Voter[];
  setWallets: (wallets: types.Voter[]) => void;
  requiredFields: string[];
  customOptionNames: types.VoterCustomFields;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [wallet, setWallet] = useState(walletData.public_key);
  const [optionalFields, setOptionalFields] = useState(() => {
    const fields: types.VoterCustomFields = {};

    requiredFields.forEach((field) => {
      let key;

      if (field === 'Twitter Handle') {
        key = 'twitter';
      } else {
        key =
          customOptionNames[field]?.replace(' ', '_').toLowerCase() ||
          field.replace(' ', '_').toLowerCase();
      }

      fields[field] = walletData[key] || '';
    });

    return fields;
  });

  const [inputError, setInputError] = useState<{ [key: string]: boolean }>({});

  const saveEdit = () => {
    let errors: { [key: string]: boolean } = {};
    let hasError = false;

    if (!wallet.trim()) {
      errors.wallet = true;
      hasError = true;
    }

    requiredFields.forEach((field) => {
      if (!optionalFields[field]?.trim()) {
        errors[field] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setInputError(errors);
      return;
    }

    const updatedWalletData: types.Voter = { public_key: wallet.trim() };

    requiredFields.forEach((field) => {
      const key = field.replace(' ', '_').toLowerCase();

      updatedWalletData[key] = optionalFields[field].trim();
    });

    const updatedWallets = [...wallets];
    updatedWallets[index] = updatedWalletData;
    console.log(updatedWallets)
    setWallets(updatedWallets);
    setIsEditing(false);
    setInputError({});
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setWallet(walletData.wallet);
    setOptionalFields(() => {
      const fields: types.VoterCustomFields = {};
      requiredFields.forEach((field) => {
        const key = field.replace(' ', '_').toLowerCase();
        fields[field] = walletData[key] || '';
      });
      return fields;
    });
    setInputError({});
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit();
    }
  };

  const deleteWallet = () => {
    const updatedWallets = wallets.filter((_, i) => i !== index);

    setWallets(updatedWallets);

    if (index === 0 && updatedWallets.length > 0) {
      const newFirstWallet = updatedWallets[0];
      const newRequiredFields = requiredFields.filter((field) => {
        const key = field.replace(' ', '_').toLowerCase();
        return newFirstWallet[key];
      });
    }
  };

  return (
    <div className='w-[740px] max-h-12 min-h-12 flex items-center px-4 bg-[#1E1E1E] text-white rounded-[73px] border border-[#1E1E1E]'>
      {isEditing ? (
        <>
          <input
            type='text'
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            onKeyDown={handleKeyPress}
            className={`flex-1 h-8 p-1 bg-[#222] text-white rounded-[73px] border ${
              inputError.wallet ? 'border-red-500' : 'border-[#1E1E1E]'
            } mr-2`}
          />

          {requiredFields.map((field) => {
            const displayName =
              field === 'Twitter Handle'
                ? field
                : customOptionNames[field] || field;
            return (
              <div
                key={field}
                className='flex items-center '
              >
                {field === 'Twitter Handle' && (
                  <span className='text-white mr-1'>@</span>
                )}
                <input
                  type='text'
                  placeholder={displayName}
                  value={optionalFields[field]}
                  onChange={(e) =>
                    setOptionalFields((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  onKeyDown={handleKeyPress}
                  className={`w-[130px] max-w-[150px] overflow-x-scroll h-8 p-1 bg-[#222222] text-white rounded-[73px] border ${
                    inputError[field] ? 'border-red-500' : 'border-[#1E1E1E]'
                  }`}
                />
              </div>
            );
          })}

          <button
            onClick={saveEdit}
            className='w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center ml-2'
          >
            ✓
          </button>
          <button
            onClick={cancelEdit}
            className='rounded-full flex items-center justify-center mx-1'
          >
            <Image.default
              src={DeleteIcon}
              alt='Delete'
              width={20}
              height={20}
            />
          </button>
        </>
      ) : (
        <>
          <span className='flex-1 text-[#B7B7B7] text-[14px]  overflow-x-scroll'>
            {walletData.public_key}
          </span>{' '}
          {requiredFields.map((field) => {
            let key;
            if (field === 'Twitter Handle') {
              key = 'twitter';
            } else {
              key =
                customOptionNames[field]?.replace(' ', '_').toLowerCase() ||
                field.replace(' ', '_').toLowerCase();
            }
            const displayName =
              field === 'Twitter Handle'
                ? field
                : customOptionNames[field] || field;
            return (
              walletData[key] && (
                <div
                  key={field}
                  className='flex items-center px-2 py-1 bg-[#222222] rounded-full mx-2 text-[#B7B7B7] text-[14px]  max-w-[150px] overflow-x-scroll'
                >
                  <span className='text-nowrap'>
                    {field === 'Twitter Handle'
                      ? `@${walletData[key]}`
                      : `${displayName}: ${walletData[key]}`}
                  </span>
                </div>
              )
            );
          })}
          <button
            onClick={() => setIsEditing(true)}
            className='rounded-full flex items-center justify-center mx-1'
          >
            <Image.default
              src={EditIcon}
              alt='Edit'
              width={24}
              height={24}
            />
          </button>
          <button
            onClick={deleteWallet}
            className='rounded-full flex items-center justify-center mx-1'
          >
            <Image.default
              src={DeleteIcon}
              alt='Delete'
              width={20}
              height={20}
            />
          </button>
        </>
      )}
    </div>
  );
};
const WalletInput = ({
  wallets,
  setWallets,
  requiredFields,
  setCustomOptionNamesInParent,
  setRequiredFields,
}: {
  wallets: types.Voter[];
  setWallets: (wallets: types.Voter[]) => void;
  requiredFields: string[];
  setRequiredFields: (fields: string[]) => void;
  setCustomOptionNamesInParent: (names: types.VoterCustomFields) => void;
}) => {
  const [wallet, setWallet] = useState('');
  const [optionalFields, setOptionalFields] = useState<types.VoterCustomFields>({});
  const [selectedOptionalFields, setSelectedOptionalFields] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputError, setInputError] = useState<{ [key: string]: boolean }>({});
  const [shake, setShake] = useState(false);
  const [customOptionNames, setCustomOptionNames] = useState<types.VoterCustomFields>({});
  const [newCustomOption, setNewCustomOption] = useState('');

  const isFirstWallet = wallets.length === 0;

  const addWallet = () => {
    let errors: { [key: string]: boolean } = {};
    let hasError = false;

    if (!wallet.trim()) {
      errors.wallet = true;
      hasError = true;
    }

    const fieldsToValidate = isFirstWallet
      ? selectedOptionalFields
      : requiredFields;

    fieldsToValidate.forEach((field) => {
      if (!optionalFields[field]?.trim()) {
        errors[field] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setInputError(errors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const walletData: types.Voter = { public_key: wallet.trim() };

    fieldsToValidate.forEach((field) => {
      let key;
      if (field === 'Twitter Handle') {
        key = 'twitter';
      } else {
        key =
          customOptionNames[field]?.replace(' ', '_').toLowerCase() ||
          field.replace(' ', '_').toLowerCase();
      }
      walletData[key] = optionalFields[field].trim();
    });

    setWallets([...wallets, walletData]);

    if (isFirstWallet) {
      setRequiredFields(selectedOptionalFields);
      setCustomOptionNamesInParent(customOptionNames);
    }

    setWallet('');
    setOptionalFields({});
    setInputError({});
  };

  const handleAddTwitterHandle = () => {
    if (!selectedOptionalFields.includes('Twitter Handle')) {
      setSelectedOptionalFields((prev) => [...prev, 'Twitter Handle']);
      setShowDropdown(false);
    }
  };

  const handleAddCustomOption = () => {
    if (newCustomOption.trim() === '') return;

    setSelectedOptionalFields((prev) => [...prev, newCustomOption]);
    setCustomOptionNames((prev) => ({
      ...prev,
      [newCustomOption]: newCustomOption,
    }));
    setNewCustomOption('');
    setShowDropdown(false);
  };

  const removeOptionalField = (field: string) => {
    setSelectedOptionalFields((prev) => prev.filter((f) => f !== field));
    setOptionalFields((prev) => {
      const newFields = { ...prev };
      delete newFields[field];
      return newFields;
    });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addWallet();
    }
  };

  return (
    <div
      className={`flex items-center space-x-2 w-full justify-start ${
        shake ? 'animate-shake' : ''
      }`}
    >
      <input
        type='text'
        placeholder='types.Voter ID'
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
        onKeyDown={handleKeyPress}
        className={`w-[578px] h-12 p-2 bg-[#222] text-white rounded-[23px] border ${
          inputError.wallet ? 'border-red-500' : 'border-[#1E1E1E]'
        }`}
      />

      {(isFirstWallet ? selectedOptionalFields : requiredFields).map(
        (field) => {
          const customName = customOptionNames[field] || field;
          return (
            <div
              key={field}
              className='flex items-center'
            >
              {field === 'Twitter Handle' && (
                <span className='text-white mr-1'>@</span>
              )}
              <input
                type='text'
                placeholder={customName}
                value={optionalFields[field] || ''}
                onChange={(e) =>
                  setOptionalFields((prev) => ({
                    ...prev,
                    [field]: e.target.value,
                  }))
                }
                onKeyPress={handleKeyPress}
                className={`w-[140px] h-12 p-2 bg-[#222] text-white rounded-[23px] border ${
                  inputError[field] ? 'border-red-500' : 'border-[#1E1E1E]'
                }`}
              />
              {isFirstWallet && (
                <button
                  onClick={() => removeOptionalField(field)}
                  className='ml-2 w-6 h-6 bg-[#1E1E1E] text-white rounded-full flex items-center justify-center'
                >
                  ×
                </button>
              )}
            </div>
          );
        }
      )}

      {isFirstWallet && (
        <div className='relative'>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className='w-12 h-12 flex items-center justify-center'
          >
            <ChevronDownIcon.default
              className={`w-6 h-6 text-white transform transition-transform duration-200 ${
                showDropdown ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>

          {showDropdown && (
            <div className='absolute top-full mt-2 right-0 w-40 bg-[#222] border border-[#1E1E1E] rounded-[23px] text-white z-10 overflow-hidden'>
              {!selectedOptionalFields.includes('Twitter Handle') && (
                <button
                  onClick={handleAddTwitterHandle}
                  className='w-full text-left px-4 py-3 hover:bg-[#555]'
                >
                  Twitter Handle
                </button>
              )}

              <input
                type='text'
                placeholder='Add custom field'
                value={newCustomOption}
                onChange={(e) => setNewCustomOption(e.target.value)}
                className='w-full h-12 bg-[#333] text-white focus:outline-none border-transparent focus:border-transparent focus:ring-0 px-2 '
              />
              <button
                onClick={handleAddCustomOption}
                className='w-full bg-[#444] px-2 py-3 rounded text-white hover:bg-[#555]'
              >
                Add Field
              </button>
            </div>
          )}
        </div>
      )}
      <button
        onClick={addWallet}
        className='w-12 h-12 bg-[#222] text-white rounded-[23px] border border-[#1E1E1E] flex items-center justify-center'
      >
        <Image.default
          width={20}
          height={20}
          src={PlusIcon}
          alt='Plus Icon'
        />
      </button>
    </div>
  );
};

export default ({ onPrevious, onSubmit }: {
  onPrevious: () => void;
  onSubmit: (wallets: types.Voter[]) => void;
}) => {
  const [wallets, setWallets] = useState<types.Voter[]>([]);
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [customOptionNames, setCustomOptionNames] = useState<types.VoterCustomFields>({});

  const isSubmitEnabled = wallets.length > 0;

  const handleSubmit = () => {
    if (isSubmitEnabled) {
      onSubmit(wallets);
    }
  };

  return (
    <div className='flex flex-col h-[calc(100vh-215px)] p-4'>
      <div className='mb-4'>
        <h3 className='text-white text-xl'>Step 2: Add types.Voter Addresses</h3>
      </div>

      <div className='mb-8'>
        <WalletInput
          wallets={wallets}
          setWallets={setWallets}
          requiredFields={requiredFields}
          setRequiredFields={setRequiredFields}
          setCustomOptionNamesInParent={setCustomOptionNames}
        />
      </div>

      <div className='flex-1 overflow-y-auto'>
        <div className='w-full overflow-y-scroll flex flex-col space-y-2 items-start'>
          {wallets.map((eachWallet, index) => (
            <WalletItem
              key={index}
              index={index}
              walletData={eachWallet}
              wallets={wallets}
              setWallets={setWallets}
              requiredFields={requiredFields}
              customOptionNames={customOptionNames}
            />
          ))}
        </div>
      </div>

      <div className='flex justify-between mt-4'>
        <Button
          variant='back'
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
