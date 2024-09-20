import { useState } from 'react';

export function TestSelect() {
  const [value, setValue] = useState<string>("creationDate");

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test Select Component</h2>
      <select
        value={value}
        onChange={(e) => {
          console.log("Selected value:", e.target.value);
          setValue(e.target.value);
        }}
        className="w-[180px] p-2 border rounded"
      >
        <option value="creationDate">Newest</option>
        <option value="topLikes">Top Likes</option>
        <option value="userLikes">My Likes</option>
      </select>
      <p className="mt-4">Current value: {value}</p>
    </div>
  );
}