"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react"; // Using Eye for "View Details"
import { useParams, useRouter } from "next/navigation";
import { OrderColumn } from "./columns"; // Assuming OrderColumn is exported from columns.tsx

interface CellActionProps {
  data: OrderColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  const onViewDetails = () => {
    // router.push(`/${params.storeId}/orders/${data.id}`); // Navigate to order details page
    console.log(`View details for order: ${data.id}`); // Placeholder action
    // For now, we'll just log. Navigation can be added when the details page exists.
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={onViewDetails}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {/* Add other actions like "Update Status" here if needed */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
