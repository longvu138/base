import { Collapse, Skeleton } from 'antd';

export const FaqsStyle1 = ({ faqs, isLoading }: any) => {
    if (isLoading) return <Skeleton active />;
    return (
        <Collapse className="bg-white rounded-xl border-0 overflow-hidden">
            {faqs?.map((faq: any) => (
                <Collapse.Panel header={faq.question} key={faq.id}>
                    <p className="text-gray-600">{faq.answer}</p>
                </Collapse.Panel>
            ))}
        </Collapse>
    );
};
