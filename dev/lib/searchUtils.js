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
      const interests = Array.isArray(profile.interests) ? profile.interests : []
      const query = fullQuery.toLowerCase()
      let score = 0
  
      // Check exact matches for full query
      if (interests.some(interest => interest.toLowerCase() === query)) {
        score += 100
      }
  
      // Check each search term against each interest
      searchTerms.forEach(term => {
        const termLower = term.toLowerCase()
        interests.forEach(interest => {
          const interestLower = interest.toLowerCase()
          if (interestLower === termLower) score += 50
          if (interestLower.includes(termLower)) score += 30
          if (interestLower.startsWith(termLower)) score += 20
        })
      })
  
      return score
    }
  }