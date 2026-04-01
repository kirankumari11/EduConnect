import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";

const categories = [
  { id: "nextjs", label: "Next JS" },
  { id: "data science", label: "Data Science" },
  { id: "frontend development", label: "Frontend Development" },
  { id: "fullstack development", label: "Fullstack Development" },
  { id: "mern stack development", label: "MERN Stack Development" },
  { id: "backend development", label: "Backend Development" },
  { id: "javascript", label: "Javascript" },
  { id: "python", label: "Python" },
  { id: "docker", label: "Docker" },
  { id: "mongodb", label: "MongoDB" },
  { id: "html", label: "HTML" },
];

// client/src/components/Filter.jsx

// ... (keep categories array as is)

const Filter = ({ handleFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");

  const handleCategoryChange = (categoryLabel) => {
    setSelectedCategories((prevCategories) => {
      // FIX: Use label instead of id to match Database values
      const newCategories = prevCategories.includes(categoryLabel)
        ? prevCategories.filter((label) => label !== categoryLabel)
        : [...prevCategories, categoryLabel];

        handleFilterChange(newCategories, sortByPrice);
        return newCategories;
    });
  };

  const selectByPriceHandler = (selectedValue) => {
    setSortByPrice(selectedValue);
    handleFilterChange(selectedCategories, selectedValue);
  }

  return (
    <div className="w-full md:w-[20%]">
      {/* ... (keep Sort UI as is) */}
      <Separator className="my-4" />
      <div>
        <h1 className="font-semibold mb-2">CATEGORY</h1>
        {categories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2 my-2">
            <Checkbox
              id={category.id}
              // FIX: Pass category.label to the handler
              onCheckedChange={() => handleCategoryChange(category.label)}
            />
            <Label htmlFor={category.id} className="text-sm font-medium leading-none">
              {category.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filter;
