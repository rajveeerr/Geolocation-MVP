// web/src/pages/admin/CustomerManagementPage.tsx
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { Input } from '@/components/ui/input';

// MOCK API HOOK
const useAllCustomers = () => useQuery({
    queryKey: ['allCustomers'],
    queryFn: async () => {
        // MOCK DATA
        return [
            { id: 1, name: 'John Doe', email: 'john@gmail.com', city: 'New York', state: 'NY', totalSpend: 150.75, isPaidMember: true },
            { id: 2, name: 'Jane Smith', email: 'jane@gmail.com', city: 'Atlanta', state: 'GA', totalSpend: 80.20, isPaidMember: false },
        ];
    }
});

export const CustomerManagementPage = () => {
    const { data: customers, isLoading } = useAllCustomers();
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-neutral-900">Customer Management</h1>
            <div className="mt-4 bg-white p-4 rounded-lg border shadow-sm">
                <Input placeholder="Search customers by name, email, or city..." className="max-w-md mb-4" />
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Location</th>
                            <th className="text-left p-2">Total Spend</th>
                            <th className="text-left p-2">Paid Member</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers?.map(customer => (
                            <tr key={customer.id} className="border-b">
                                <td className="p-2">{customer.name}</td>
                                <td className="p-2">{customer.email}</td>
                                <td className="p-2">{customer.city}, {customer.state}</td>
                                <td className="p-2">${customer.totalSpend.toFixed(2)}</td>
                                <td className="p-2">{customer.isPaidMember ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};