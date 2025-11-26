import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
    q: string;
    a: string;
}

interface FAQAccordionProps {
    faqs: FAQItem[];
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs }) => {
    const [openIndex, setOpenIndex] = useState<number>(0);

    return (
        <div className="space-y-4">
            {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                    <div
                        key={index}
                        className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden transition-all duration-300 hover:border-teal-300"
                    >
                        <button
                            onClick={() => setOpenIndex(isOpen ? -1 : index)}
                            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                        >
                            <span className="text-lg font-bold text-slate-900 pr-4">{faq.q}</span>
                            <div className="flex-shrink-0">
                                {isOpen ? (
                                    <Minus className="w-5 h-5 text-slate-600" />
                                ) : (
                                    <Plus className="w-5 h-5 text-slate-600" />
                                )}
                            </div>
                        </button>

                        {isOpen && (
                            <div className="px-6 pb-5 pt-2 text-slate-600 leading-relaxed border-t border-slate-100">
                                {faq.a}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default FAQAccordion;
