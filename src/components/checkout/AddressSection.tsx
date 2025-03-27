import React from 'react';

type AddressType = {
  id: string;
  name: string;
  postalCode: string;
  prefecture: string;
  city: string;
  line1: string;
  line2: string | null;
  phoneNumber: string;
  isDefault: boolean;
};

type AddressSectionProps = {
  addresses: AddressType[];
  selectedAddressId: string;
  onAddressSelect: (id: string) => void;
  onAddNew: () => void;
  onDelete: (id: string) => void;
  isProcessing: boolean;
};

const AddressSection: React.FC<AddressSectionProps> = ({
  addresses,
  selectedAddressId,
  onAddressSelect,
  onAddNew,
  onDelete,
  isProcessing
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">お届け先</h2>
        <button 
          className="text-orange-500 hover:text-orange-600"
          onClick={onAddNew}
        >
          <span className="text-xl">+</span>
        </button>
      </div>
      
      {addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`border rounded-lg p-4 cursor-pointer ${
                selectedAddressId === address.id 
                  ? "border-orange-500 bg-orange-50" 
                  : "hover:border-gray-400"
              }`}
              onClick={() => onAddressSelect(address.id)}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    <input 
                      type="radio" 
                      checked={selectedAddressId === address.id}
                      onChange={() => onAddressSelect(address.id)}
                      className="accent-orange-500"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{address.name}</p>
                    <p className="text-sm text-gray-700">
                      〒{address.postalCode} {address.prefecture}{address.city}
                    </p>
                    <p className="text-sm text-gray-700">
                      {address.line1} {address.line2}
                    </p>
                    <p className="text-sm text-gray-700">
                      {address.phoneNumber}
                    </p>
                    {address.isDefault && (
                      <span className="inline-block mt-1 text-xs bg-gray-200 rounded px-2 py-1">
                        デフォルト
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <button 
                    className="text-red-500 hover:text-red-700 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('この住所を削除してもよろしいですか？')) {
                        onDelete(address.id);
                      }
                    }}
                    disabled={isProcessing}
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-4 text-gray-700">
          <p>お届け先を追加してください</p>
        </div>
      )}
    </div>
  );
};

export default AddressSection;
