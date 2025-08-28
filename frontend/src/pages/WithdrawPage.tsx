import React, { useState } from 'react';
import Layout from '../components/layout/Layout';

type PaymentMethod = {
  id: string;
  label: string;
  logo: string;
};

const paymentMethods: PaymentMethod[] = [
  { id: 'cbe', label: 'Commercial Bank of Ethiopia', logo: '/bank-logo/CBE-logo.jpg' },
  { id: 'telebirr', label: 'Telebirr', logo: '/bank-logo/Telebirr.jpg' },
  { id: 'cbebirr', label: 'CBE Birr', logo: '/bank-logo/cbebirr.png' },
  { id: 'dashen', label: 'Dashen Bank', logo: '/bank-logo/dashn%20bank.png' },
];

const WithdrawPage: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Withdraw submit:', { amount, selectedMethod });
  };

  return (
    <Layout  showHeaderNavigation={false}>
     <div className="bg-dark-blue py-8">
     <div className="container mx-auto px-4">
          <div className="bg-gray-200 border border-gray-300 rounded-xl shadow-md p-4 sm:p-6 mx-[0.3cm] mb-[0.3cm]">
            {/* Balance pill aligned right */}
            <div className="flex justify-end mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-3 border-4 border-gray-300 rounded-full px-6 py-1 bg-white">
                <span className="text-lg sm:text-xl font-semibold px-2 py-0.5 bg-white">Balance</span>
                <span className="text-lg sm:text-xl font-semibold text-dark">1,200 ETB</span>
              </div>
            </div>

            {/* Two column layout on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Left panel */}
              <div className="bg-white border-3 border-gray-300 rounded-xl p-4 sm:p-6 min-w-0">
                {/* Title */}
                <h1 className="text-center text-lg sm:text-xl font-bold text-dark-blue mb-6">Withdraw</h1>

                {/* Amount row */}
                <form onSubmit={handleContinue}>
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <span className="text-lg sm:text-xl font-semibold text-dark-blue">ETB</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter Amount"
                      className="w-full sm:flex-1 px-4 py-2 border-1 border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Payment method */}
                  <p className="font-semibold text-center sm:text-left text-dark-blue mb-4">Choose payment method</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {paymentMethods.map((method) => (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full h-24 sm:h-28 rounded-xl border-4 bg-white flex flex-col items-center justify-center text-center px-2 transition-colors ${
                          selectedMethod === method.id ? 'border-blue-500 shadow-sm' : 'border-blue-300'
                        }`}
                        aria-pressed={selectedMethod === method.id}
                      >
                        <img src={method.logo} alt={method.label} className="h-16 sm:h-20 object-contain mb-2" />
                        <span className="text-xs sm:text-sm font-medium text-dark-blue">{method.label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={!amount || !selectedMethod}
                    className={`block mx-auto w-3/4 sm:w-1/2 text-white font-semibold rounded-xl py-4 ${
                      !amount || !selectedMethod ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-red-700'
                    }`}
                  >
                    Continue
                  </button>
                </form>
              </div>

              {/* Right panel: Transaction history */}
              <div className="bg-white border-3 border-gray-300 rounded-xl p-4 sm:p-6 min-w-0">
                <h2 className="text-center text-lg sm:text-xl font-bold text-dark-blue mb-4">Transaction History</h2>
                <div className="border border-gray-300 rounded-lg overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left font-semibold text-dark-blue border border-gray-300">Deposit</th>
                        <th className="px-3 py-2 text-left font-semibold text-dark-blue border border-gray-300">Withdrawal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 8 }).map((_, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 border border-gray-300"></td>
                          <td className="px-3 py-2 border border-gray-300 text-red-600 font-semibold">{idx === 0 ? '-300' : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WithdrawPage;