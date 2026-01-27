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
  // Subscribe only to the ID to avoid object reference changes
  const selectedProjectId = useStore((state) => state.selectedProject?.id);
  const loadedProjectIds = useRef(new Set());

  useEffect(() => {
    if (!selectedProjectId || !azdoService) return;
    if (loadedProjectIds.current.has(selectedProjectId)) return;

    const loadDetailedProject = async () => {
      try {
        loadedProjectIds.current.add(selectedProjectId);
        const store = useStore.getState();
        const currentProject = store.selectedProject;

        // Check if already has detailed data
        if (currentProject?._links) return;

        logger.debug('Loading detailed project data', {
          projectId: selectedProjectId,
          projectName: currentProject?.name,
        });

        const detailedProject = await azdoService.getProject(selectedProjectId);

        if (detailedProject) {
          store.updateProject(selectedProjectId, detailedProject);
          logger.debug('Project details loaded', {
            projectId: selectedProjectId,
            hasLinks: !!detailedProject._links,
          });
        }
      } catch (err) {
        logger.warn('Failed to load detailed project data', {
          projectId: selectedProjectId,
          error: err.message,
        });
        // Don't set error state - this is background loading
      }
    };

    loadDetailedProject();
  }, [selectedProjectId, azdoService]);
}

/**
 * Loads detailed repository data (with _links) after repository is selected
 * Updates the store when detailed data is available
 * @param {Object} azdoService - Azure DevOps service instance
 */
export function useDetailedRepositoryLoader(azdoService) {
  // Subscribe only to IDs to avoid object reference changes
  const selectedProjectId = useStore((state) => state.selectedProject?.id);
  const selectedRepositoryId = useStore(
    (state) => state.selectedRepository?.id
  );
  const isViewAll = useStore((state) => state.selectedRepository?._isViewAll);
  const loadedRepositoryIds = useRef(new Set());

  useEffect(() => {
    if (!selectedRepositoryId || !selectedProjectId || !azdoService) return;
    if (isViewAll) return; // "View All" is not a real repository
    if (loadedRepositoryIds.current.has(selectedRepositoryId)) return;

    const loadDetailedRepository = async () => {
      try {
        loadedRepositoryIds.current.add(selectedRepositoryId);
        const store = useStore.getState();
        const currentRepo = store.selectedRepository;

        // Check if already has detailed data
        if (currentRepo?._links) return;

        logger.debug('Loading detailed repository data', {
          repositoryId: selectedRepositoryId,
          repositoryName: currentRepo?.name,
        });

        const detailedRepository = await azdoService.getRepository(
          selectedProjectId,
          selectedRepositoryId
        );

        if (detailedRepository) {
          store.updateRepository(selectedRepositoryId, detailedRepository);
          logger.debug('Repository details loaded', {
            repositoryId: selectedRepositoryId,
            hasLinks: !!detailedRepository._links,
          });
        }
      } catch (err) {
        logger.warn('Failed to load detailed repository data', {
          repositoryId: selectedRepositoryId,
          error: err.message,
        });
        // Don't set error state - this is background loading
      }
    };

    loadDetailedRepository();
  }, [selectedProjectId, selectedRepositoryId, isViewAll, azdoService]);
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
  // Subscribe only to IDs to avoid object reference changes
  const selectedProjectId = useStore((state) => state.selectedProject?.id);
  const selectedRepositoryId = useStore(
    (state) => state.selectedRepository?.id
  );
  const loadedAlertIds = useRef(new Set());

  useEffect(() => {
    if (!currentAlert || !selectedProjectId || !azdoService) return;
    // Only load detailed data for secret alerts (type 2) that don't already have fingerprints
    if (currentAlert.alertType !== 2) return;
    if (currentAlert.validationFingerprints) return; // Already has fingerprint data
    if (loadedAlertIds.current.has(currentAlert.alertId)) return;

    // Get the repository ID - from alert or selected repository
    const repoId = currentAlert.repositoryId || selectedRepositoryId;
    if (!repoId) {
      logger.warn('Cannot load alert details - no repository ID available');
      return;
    }

    const loadDetailedAlert = async () => {
      try {
        loadedAlertIds.current.add(currentAlert.alertId);
        const store = useStore.getState();
        const project = store.selectedProject;

        logger.debug('Loading detailed alert data with fingerprint', {
          alertId: currentAlert.alertId,
          projectName: project?.name,
          repositoryId: repoId,
        });

        const detailedAlert = await azdoService.getAlert(
          project.name,
          repoId,
          currentAlert.alertId,
          { includeFingerprint: true }
        );

        if (detailedAlert) {
          store.updateAlert(currentAlert.alertId, detailedAlert);
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
  }, [
    currentAlert?.alertId,
    currentAlert?.alertType,
    currentAlert?.validationFingerprints,
    selectedProjectId,
    selectedRepositoryId,
    azdoService,
  ]);
}

export default useDetailedEntityLoader;
