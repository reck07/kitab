const RULES_KEY = 'kitab_automation_rules';

export function getRules() {
  return JSON.parse(localStorage.getItem(RULES_KEY) || '[]');
}

export function saveRules(rules) {
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export function addRule(rule) {
  const rules = getRules();
  rules.push({ ...rule, id: Date.now(), enabled: true });
  saveRules(rules);
  return rules;
}

export function updateRule(id, updates) {
  const rules = getRules().map(r => r.id === id ? { ...r, ...updates } : r);
  saveRules(rules);
  return rules;
}

export function removeRule(id) {
  const rules = getRules().filter(r => r.id !== id);
  saveRules(rules);
  return rules;
}

export function evaluateRules(note, trigger, notes = []) {
  const rules = getRules().filter(r => r.enabled && r.trigger === trigger);
  const actions = [];

  for (const rule of rules) {
    let match = true;
    if (rule.conditionTag && !note.tags?.includes(rule.conditionTag)) match = false;
    if (rule.conditionFolder && note.folder !== rule.conditionFolder) match = false;
    if (rule.conditionContent && !(note.content || '').toLowerCase().includes(rule.conditionContent.toLowerCase())) match = false;

    if (match) {
      if (rule.actionAddTag) actions.push({ type: 'addTag', value: rule.actionAddTag });
      if (rule.actionRemoveTag) actions.push({ type: 'removeTag', value: rule.actionRemoveTag });
      if (rule.actionArchive) actions.push({ type: 'archive', value: true });
      if (rule.actionPin) actions.push({ type: 'pin', value: true });
    }
  }

  return actions;
}

export function applyActions(note, actions) {
  let updated = { ...note, tags: [...(note.tags || [])] };
  for (const action of actions) {
    switch (action.type) {
      case 'addTag':
        if (!updated.tags.includes(action.value)) updated.tags.push(action.value);
        break;
      case 'removeTag':
        updated.tags = updated.tags.filter(t => t !== action.value);
        break;
      case 'archive':
        updated.isArchived = action.value;
        break;
      case 'pin':
        updated.isPinned = action.value;
        break;
    }
  }
  return updated;
}
