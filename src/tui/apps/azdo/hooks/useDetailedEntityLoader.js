/**
 * Hook to load detailed project/repository data in the background
 * Replaces list data (which lacks _links) with detailed data (which has _links)
 */

import { useEffect, useRef } from 'react';
import { useStore } from '../state/AppContext.js';
import logger from '../../../../utils/logger.js';

/**
 * Loads detailed project data (with _links) after project list is displayed
 * Updates the store when detailed data is available
 * @param {Object} azdoService - Azure DevOps service instance
 */
export function useDetailedProjectLoader(azdoService) {
  const selectedProject = useStore((state) => state.selectedProject);
  const loadedProjectIds = useRef(new Set());

  useEffect(() => {
    if (!selectedProject || !azdoService) return;
    if (loadedProjectIds.current.has(selectedProject.id)) return;
    if (selectedProject._links) return; // Already has detailed data

    const loadDetailedProject = async () => {
      try {
        loadedProjectIds.current.add(selectedProject.id);
        logger.debug('Loading detailed project data', {
          projectId: selectedProject.id,
          projectName: selectedProject.name,
        });

        const detailedProject = await azdoService.getProject(
          selectedProject.id
        );

        if (detailedProject) {
          useStore.getState().updateProject(selectedProject.id, detailedProject);
          logger.debug('Project details loaded', {
            projectId: selectedProject.id,
            hasLinks: !!detailedProject._links,
          });
        }
      } catch (err) {
        logger.warn('Failed to load detailed project data', {
          projectId: selectedProject.id,
          error: err.message,
        });
        // Don't set error state - this is background loading
      }
    };

    loadDetailedProject();
  }, [selectedProject?.id, azdoService]);
}

/**
 * Loads detailed repository data (with _links) after repository is selected
 * Updates the store when detailed data is available
 * @param {Object} azdoService - Azure DevOps service instance
 */
export function useDetailedRepositoryLoader(azdoService) {
  const selectedProject = useStore((state) => state.selectedProject);
  const selectedRepository = useStore((state) => state.selectedRepository);
  const loadedRepositoryIds = useRef(new Set());

  useEffect(() => {
    if (!selectedRepository || !selectedProject || !azdoService) return;
    if (selectedRepository._isViewAll) return; // "View All" is not a real repository
    if (loadedRepositoryIds.current.has(selectedRepository.id)) return;
    if (selectedRepository._links) return; // Already has detailed data

    const loadDetailedRepository = async () => {
      try {
        loadedRepositoryIds.current.add(selectedRepository.id);
        logger.debug('Loading detailed repository data', {
          repositoryId: selectedRepository.id,
          repositoryName: selectedRepository.name,
        });

        const detailedRepository = await azdoService.getRepository(
          selectedProject.id,
          selectedRepository.id
        );

        if (detailedRepository) {
          useStore
            .getState()
            .updateRepository(selectedRepository.id, detailedRepository);
          logger.debug('Repository details loaded', {
            repositoryId: selectedRepository.id,
            hasLinks: !!detailedRepository._links,
          });
        }
      } catch (err) {
        logger.warn('Failed to load detailed repository data', {
          repositoryId: selectedRepository.id,
          error: err.message,
        });
        // Don't set error state - this is background loading
      }
    };

    loadDetailedRepository();
  }, [selectedProject?.id, selectedRepository?.id, azdoService]);
}

/**
 * Combined hook that loads both project and repository details
 * @param {Object} azdoService - Azure DevOps service instance
 */
export function useDetailedEntityLoader(azdoService) {
  useDetailedProjectLoader(azdoService);
  useDetailedRepositoryLoader(azdoService);
}

/**
 * Loads detailed alert data (with validationFingerprints) when current alert changes
 * Updates the store when detailed data is available (for secret alerts)
 * @param {Object} azdoService - Azure DevOps service instance
 * @param {Object} currentAlert - Current alert object
 */
export function useDetailedAlertLoader(azdoService, currentAlert) {
  const selectedProject = useStore((state) => state.selectedProject);
  const selectedRepository = useStore((state) => state.selectedRepository);
  const loadedAlertIds = useRef(new Set());

  useEffect(() => {
    // Debug logging
    logger.info('useDetailedAlertLoader check', {
      hasCurrentAlert: !!currentAlert,
      alertId: currentAlert?.alertId,
      alertType: currentAlert?.alertType,
      hasFingerprints: !!currentAlert?.validationFingerprints,
      hasProject: !!selectedProject,
      projectName: selectedProject?.name,
      hasRepo: !!selectedRepository,
      repoId: selectedRepository?.id,
      alertRepoId: currentAlert?.repositoryId,
      alreadyLoaded: loadedAlertIds.current.has(currentAlert?.alertId),
    });

    if (!currentAlert || !selectedProject || !azdoService) return;
    // Only load detailed data for secret alerts (type 2) that don't already have fingerprints
    if (currentAlert.alertType !== 2) return;
    if (currentAlert.validationFingerprints) return; // Already has fingerprint data
    if (loadedAlertIds.current.has(currentAlert.alertId)) return;

    // Get the repository ID - from alert or selected repository
    const repoId = currentAlert.repositoryId || selectedRepository?.id;
    if (!repoId) {
      logger.warn('Cannot load alert details - no repository ID available');
      return;
    }

    const loadDetailedAlert = async () => {
      try {
        loadedAlertIds.current.add(currentAlert.alertId);
        logger.debug('Loading detailed alert data with fingerprint', {
          alertId: currentAlert.alertId,
          projectName: selectedProject.name,
          repositoryId: repoId,
        });

        const detailedAlert = await azdoService.getAlert(
          selectedProject.name,
          repoId,
          currentAlert.alertId,
          { includeFingerprint: true }
        );

        if (detailedAlert) {
          useStore.getState().updateAlert(currentAlert.alertId, detailedAlert);
          logger.debug('Alert details with fingerprint loaded', {
            alertId: currentAlert.alertId,
            hasFingerprints: !!detailedAlert.validationFingerprints,
          });
        }
      } catch (err) {
        logger.warn('Failed to load detailed alert data', {
          alertId: currentAlert.alertId,
          error: err.message,
        });
        // Don't set error state - this is background loading
      }
    };

    loadDetailedAlert();
  }, [currentAlert?.alertId, selectedProject?.name, selectedRepository?.id, azdoService]);
}

export default useDetailedEntityLoader;
