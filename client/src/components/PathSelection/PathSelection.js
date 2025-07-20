import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaGraduationCap, 
  FaRocket, 
  FaFlask, 
  FaDna, 
  FaAtom,
  FaCalculator,
  FaLanguage,
  FaBookOpen,
  FaCheck,
  FaArrowRight
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import pathService from '../../services/pathService';
import LoadingSpinner from '../Common/LoadingSpinner';
import './PathSelection.css';

const PathSelection = ({ onPathSelected }) => {
  const { user, updateUser } = useAuth();
  const [paths, setPaths] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPathsAndScenarios();
  }, []);

  const loadPathsAndScenarios = async () => {
    try {
      setLoading(true);
      const [pathsResponse, scenariosResponse] = await Promise.all([
        pathService.getAllPaths(),
        pathService.getAllScenarios()
      ]);
      
      setPaths(pathsResponse.data);
      setScenarios(scenariosResponse.data);
    } catch (error) {
      console.error('خطأ في تحميل المسارات:', error);
      toast.error('حدث خطأ في تحميل المسارات');
    } finally {
      setLoading(false);
    }
  };

  const handlePathSelect = (path) => {
    setSelectedPath(path);
    setSelectedScenario(null);
  };

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
  };

  const handleSubmit = async () => {
    if (!selectedPath || !selectedScenario) {
      toast.error('يرجى اختيار المسار والسيناريو');
      return;
    }

    try {
      setSubmitting(true);
      await pathService.updateUserPath(user.id, selectedPath.id, selectedScenario.id);
      
      // تحديث بيانات المستخدم
      const updatedUser = {
        ...user,
        pathId: selectedPath.id,
        scenarioId: selectedScenario.id,
        pathName: selectedPath.name_ar,
        scenarioName: selectedScenario.name_ar
      };
      
      updateUser(updatedUser);
      toast.success('تم حفظ اختيارك بنجاح!');
      
      if (onPathSelected) {
        onPathSelected(selectedPath, selectedScenario);
      }
    } catch (error) {
      console.error('خطأ في حفظ المسار:', error);
      toast.error('حدث خطأ في حفظ اختيارك');
    } finally {
      setSubmitting(false);
    }
  };

  const getSubjectIcon = (subjectName) => {
    const icons = {
      mathematics: FaCalculator,
      physics: FaAtom,
      chemistry: FaFlask,
      biology: FaDna,
      english: FaLanguage,
      arabic: FaBookOpen
    };
    return icons[subjectName] || FaBookOpen;
  };

  const getSubjectColor = (subjectName) => {
    const colors = {
      mathematics: '#e74c3c',
      physics: '#3498db',
      chemistry: '#2980b9',
      biology: '#e91e63',
      english: '#27ae60',
      arabic: '#f39c12'
    };
    return colors[subjectName] || '#6c757d';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="path-selection">
      <div className="path-selection-header">
        <h1>🎯 اختر مسارك الدراسي</h1>
        <p>اختر المسار والسيناريو المناسب لأهدافك الأكاديمية</p>
      </div>

      {/* اختيار المسار */}
      <div className="selection-section">
        <h2>📚 اختر المسار</h2>
        <div className="paths-grid">
          {paths.map(path => (
            <div 
              key={path.id}
              className={`path-card ${selectedPath?.id === path.id ? 'selected' : ''}`}
              onClick={() => handlePathSelect(path)}
            >
              <div className="path-icon">
                {path.name === 'general' ? <FaGraduationCap /> : <FaRocket />}
              </div>
              <h3>{path.name_ar}</h3>
              <p>{path.description}</p>
              {selectedPath?.id === path.id && (
                <div className="selected-indicator">
                  <FaCheck />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* اختيار السيناريو */}
      {selectedPath && (
        <div className="selection-section">
          <h2>🎭 اختر السيناريو</h2>
          <div className="scenarios-grid">
            {scenarios
              .filter(scenario => scenario.path_id === selectedPath.id)
              .map(scenario => (
                <div 
                  key={scenario.id}
                  className={`scenario-card ${selectedScenario?.id === scenario.id ? 'selected' : ''}`}
                  onClick={() => handleScenarioSelect(scenario)}
                >
                  <div className="scenario-header">
                    <h3>{scenario.name_ar}</h3>
                    <p>{scenario.description}</p>
                  </div>
                  
                  <div className="scenario-subjects">
                    <h4>المواد المطلوبة:</h4>
                    <div className="subjects-list">
                      {scenario.subjects?.map(subject => {
                        const IconComponent = getSubjectIcon(subject.name);
                        return (
                          <div 
                            key={subject.id}
                            className="subject-item"
                            style={{ borderColor: getSubjectColor(subject.name) }}
                          >
                            <IconComponent 
                              style={{ color: getSubjectColor(subject.name) }}
                            />
                            <span>{subject.name_ar}</span>
                            {subject.is_core && (
                              <span className="core-badge">أساسي</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedScenario?.id === scenario.id && (
                    <div className="selected-indicator">
                      <FaCheck />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* زر التأكيد */}
      {selectedPath && selectedScenario && (
        <div className="selection-footer">
          <div className="selection-summary">
            <h3>📋 ملخص اختيارك:</h3>
            <div className="summary-item">
              <strong>المسار:</strong> {selectedPath.name_ar}
            </div>
            <div className="summary-item">
              <strong>السيناريو:</strong> {selectedScenario.name_ar}
            </div>
          </div>
          
          <button 
            className="confirm-button"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <FaArrowRight />
                تأكيد الاختيار
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PathSelection;