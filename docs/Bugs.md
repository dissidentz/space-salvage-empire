# Space Salvage Empire - Bug Tracker

*Last Updated: December 7, 2025*

---

## 🐛 Known Issues

### Open Issues

*No known bugs at this time.*

---

## ✅ Recently Fixed (v0.3.x)

| Bug | Version Fixed | Description |
|-----|---------------|-------------|
| Mission completion logic | 0.3.1 | Properly updates statistics and history |
| Game loop crashes | 0.3.1 | Added robust error handling in mission system |
| Contract type mismatches | 0.3.0 | Fixed mission completion logic |
| Missing type properties | 0.3.0 | Resolved Prestige and Game Store definitions |

---

## ✅ Previously Fixed (v0.2.x)

| Bug | Version Fixed | Description |
|-----|---------------|-------------|
| Change Orbit button | 0.2.5 | Fixed button functionality |
| Auto-Salvage dual missions | 0.2.4 | Fleet Coordination now allows 2 missions per ship |
| Scout missions accumulating | 0.2.0 | Race condition in mission completion |
| Derelict deletion | 0.1.1 | Delete button not working |
| Infinite loop in Dashboard | 0.1.3 | Mission Log page event display |
| Tech effects not applying | 0.1.4 | flat_bonus effects like Click Amplification |
| Negative resources | 0.1.4 | Production consuming more than available |
| Sidebar scroll issue | 0.1.2 | Sticky positioning fixed |

---

## 🔍 Areas to Monitor

### Potential Edge Cases
1. **Very long offline periods (>4 hours)** - Cap should handle, but verify
2. **Rapid orbit switching during travel** - Should be blocked but test
3. **Multiple automation triggers in same tick** - Should be idempotent
4. **Derelict expiration during active mission** - Protected, verify edge cases

### Performance Concerns
- Large derelict counts (50+) - UI rendering
- Long mission histories - Memory usage
- Many simultaneous missions - Game loop efficiency

---

## 📝 Bug Report Template

When adding new bugs, please use this format:

```markdown
### [Short Description]
- **Severity:** Critical / High / Medium / Low
- **Version:** x.x.x
- **Steps to Reproduce:**
  1. Step one
  2. Step two
  3. ...
- **Expected Behavior:** What should happen
- **Actual Behavior:** What actually happens
- **Notes:** Any additional context
```

---

## 🏷️ Severity Definitions

| Severity | Definition |
|----------|------------|
| **Critical** | Game-breaking, crashes, data loss |
| **High** | Major feature broken, significant impact |
| **Medium** | Feature partially works, workaround exists |
| **Low** | Minor visual/UX issue, cosmetic |
