# Clinical Assessment Test Components

## Overview
Added 4 interactive test components to help healthcare professionals accurately assess patients for the Dementia Module. Each test provides guided assessments with proper scoring and interpretation.

## Components Created

### 1. BMICalculator.jsx
**Purpose**: Calculate Body Mass Index
**Features**:
- Support for both metric (cm, kg) and imperial (inches, lbs) units
- Real-time BMI calculation
- Category classification (Underweight, Normal, Overweight, Obese)
- Color-coded results
- Direct integration with form data

**Usage**: Click "Calculate" button next to BMI field

### 2. MMSETest.jsx
**Purpose**: Mini-Mental State Examination - Cognitive assessment
**Features**:
- 6 sections: Orientation (Time & Place), Registration, Attention/Calculation, Recall, Language
- Guided step-by-step assessment
- Progress tracking
- Total score out of 30 points
- Cognitive impairment level interpretation
- Section-by-section scoring breakdown

**Scoring**:
- 24-30: Normal cognition
- 18-23: Mild cognitive impairment  
- 10-17: Moderate cognitive impairment
- 0-9: Severe cognitive impairment

### 3. ADLTest.jsx
**Purpose**: Activities of Daily Living assessment
**Features**:
- 6 basic activities: Bathing, Dressing, Toileting, Transferring, Continence, Feeding
- Binary scoring (Independent = 1, Needs assistance = 0)
- Total score out of 6 points
- Dependency level interpretation
- Visual grid layout for easy assessment

**Scoring**:
- 6: Independent in all ADLs
- 4-5: Mildly dependent
- 2-3: Moderately dependent
- 0-1: Severely dependent

### 4. FunctionalAssessmentTest.jsx
**Purpose**: Instrumental Activities of Daily Living (IADL) assessment
**Features**:
- 8 complex activities: Shopping, Housekeeping, Accounting, Food Preparation, Transportation, Medication Management, Communication, Laundry
- 3-level scoring (Independent = 1, Minimal assistance = 0.5, Cannot perform = 0)
- Total score out of 8 points
- Functional impairment level interpretation
- Grid layout for efficient assessment

**Scoring**:
- 7-8: Independent in most IADLs
- 5-6.5: Mild impairment
- 3-4.5: Moderate impairment
- 0-2.5: Severe impairment

## Integration

### Updated ClinicalDataForm.jsx
- Added state management for test modals
- Connected test results to form fields
- Added test trigger buttons
- Maintained existing validation

### Test Flow
1. User fills out basic clinical data
2. Clicks test button (Calculate, Test MMSE, Test ADL, Test FA)
3. Interactive test modal opens
4. Completes guided assessment
5. Receives scored results with interpretation
6. Can choose to use the score or retake
7. Score automatically populates in form field

## Benefits

✅ **Standardized Assessment**: Ensures consistent, evidence-based scoring
✅ **Guided Process**: Step-by-step instructions reduce assessment errors  
✅ **Educational**: Provides scoring criteria and interpretations
✅ **Time Efficient**: Quick, focused assessments
✅ **Professional**: Clinical-grade assessment tools
✅ **User Friendly**: Clear interface with progress tracking
✅ **Flexible**: Can retake tests or manually override scores

## File Structure
```
src/components/dementia/
├── ClinicalDataForm.jsx (updated)
└── tests/
    ├── BMICalculator.jsx
    ├── MMSETest.jsx
    ├── ADLTest.jsx
    └── FunctionalAssessmentTest.jsx
```

## Usage Instructions

1. **BMI Calculator**: Enter height and weight, select unit system, click calculate
2. **MMSE Test**: Work through 6 cognitive assessment sections 
3. **ADL Test**: Rate independence in 6 basic daily activities
4. **Functional Assessment**: Evaluate complex daily living skills across 8 domains

Each test provides clear instructions, scoring guidelines, and clinical interpretations to support accurate patient assessment.
