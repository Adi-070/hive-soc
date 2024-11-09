export const calculateRelevanceScore = (profile, searchTerms, fullQuery, searchType) => {
    if (searchType === 'name') {
      const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase()
      const firstName = profile.firstName.toLowerCase()
      const lastName = profile.lastName.toLowerCase()
      const query = fullQuery.toLowerCase()
      let score = 0
  
      if (fullName === query) score += 100
      if (firstName === query || lastName === query) score += 50
  
      searchTerms.forEach(term => {
        const termLower = term.toLowerCase()
        if (firstName === termLower || lastName === termLower) score += 30
        if (firstName.startsWith(termLower) || lastName.startsWith(termLower)) score += 20
        if (firstName.includes(termLower) || lastName.includes(termLower)) score += 10
      })
  
      return score
    } else {
      const interests = (profile.interests || '').toLowerCase()
      const query = fullQuery.toLowerCase()
      let score = 0
  
      if (interests === query) score += 100
      
      searchTerms.forEach(term => {
        const termLower = term.toLowerCase()
        if (interests.includes(termLower)) score += 30
        if (interests.startsWith(termLower)) score += 20
      })
  
      return score
    }
  }