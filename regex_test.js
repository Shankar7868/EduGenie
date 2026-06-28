const content = `
🃏 **Card 1** *(Definition)*
**Front:** Merge Sort
**Back:** A **divide-and-conquer** sorting algorithm that recursively breaks down an array into smaller subarrays, sorts them, and then merges them back together in sorted order.

---
🃏 **Card 2** *(Definition)*
**Front:** Merge Operation
**Back:** The core step in Merge Sort where two already sorted subarrays are combined into a single **sorted** array.
`;

const lines = content.split('\n');
const items = [];
let currentQ = "";
let currentA = "";
let inA = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Check for Question/Front
  const qMatch = line.match(/^(?:\*\*)?(?:Question|Q|Front)(?:\*\*)?\s*[:.-]?\s*(?:\*\*)?(.*?)(?:\*\*)?$/i);
  if (qMatch) {
    if (currentQ && currentA) {
      items.push({ question: currentQ, answer: currentA.trim() });
    }
    currentQ = qMatch[1].trim();
    currentA = "";
    inA = false;
    continue;
  }

  // Check for Answer/Back
  const aMatch = line.match(/^(?:\*\*)?(?:Answer|A|Back)(?:\*\*)?\s*[:.-]?\s*(?:\*\*)?(.*?)(?:\*\*)?$/i);
  if (aMatch) {
    currentA = aMatch[1].trim();
    inA = true;
    continue;
  }

  // Check for Card X header (ignore)
  if (line.match(/^🃏?\s*(?:\*\*)?Card\s+\d+(?:\*\*)?/i)) {
    continue;
  }
  
  // Horizontal rule
  if (line.match(/^---+$/)) {
      continue;
  }

  // Append to Answer if in Answer section
  if (inA) {
    currentA += "\n" + line;
  } else if (currentQ && !inA) {
    // maybe multi-line question
    currentQ += " " + line;
  }
}

if (currentQ && currentA) {
  items.push({ question: currentQ, answer: currentA.trim() });
}

console.log(items);
